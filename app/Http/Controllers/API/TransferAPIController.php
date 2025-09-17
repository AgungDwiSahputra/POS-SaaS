<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\CreateTransferRequest;
use App\Http\Requests\UpdateTransferRequest;
use App\Http\Resources\TransferCollection;
use App\Http\Resources\TransferResource;
use App\Models\ManageStock;
use App\Models\Product;
use App\Models\Transfer;
use App\Models\TransferItem;
use App\Repositories\TransferRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class TransferAPIController extends AppBaseController
{
    /** @var transferRepository */
    private $transferRepository;

    public function __construct(TransferRepository $transferRepository)
    {
        $this->transferRepository = $transferRepository;
    }

    public function index(Request $request): TransferCollection
    {
        $perPage = getPageSize($request);

        $transfers = $this->transferRepository;

        if ($request->get('status') && $request->get('status') != 'null') {
            $transfers->Where('status', $request->get('status'));
        }

        $transfers = $transfers->paginate($perPage);

        TransferResource::usingWithCollection();

        return new TransferCollection($transfers);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    public function store(CreateTransferRequest $request): TransferResource
    {
        $input = $request->all();
        $transfer = $this->transferRepository->storeTransfer($input);

        return new TransferResource($transfer);
    }

    public function show(Transfer $transfer)
    {
        $transfer = $transfer->load('transferItems.product');

        return new TransferResource($transfer);
    }

    public function edit(Transfer $transfer): TransferResource
    {
        $transfer = $transfer->load('transferItems.product.stocks', 'fromWarehouse', 'toWarehouse');

        return new TransferResource($transfer);
    }

    public function update(UpdateTransferRequest $request, $id): TransferResource
    {
        $input = $request->all();
        $transfer = $this->transferRepository->updateTransfer($input, $id);

        return new TransferResource($transfer);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Transfer  $transfer
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $transfer = $this->transferRepository->with('transferItems')->where('id', $id)->firstOrFail();

            // Revert HPP effect from line price revaluation (if toggle on and transfer completed)
            if ($transfer->status == \App\Models\Transfer::COMPLETED && (int) (getSettingValue('transfer_line_revalue_hpp') ?? 0) === 1) {
                $items = $transfer->transferItems;
                if ($items && $items->count() > 0) {
                    $qtyByProduct = [];
                    $amountByProduct = [];
                    foreach ($items as $it) {
                        $pid = $it->product_id;
                        $qtyByProduct[$pid] = ($qtyByProduct[$pid] ?? 0) + (float) $it->quantity;
                        $amountByProduct[$pid] = ($amountByProduct[$pid] ?? 0) + (float) $it->sub_total;
                    }
                    foreach ($qtyByProduct as $pid => $movedQty) {
                        /** @var Product $prod */
                        $prod = Product::find($pid);
                        if (! $prod) { continue; }
                        $totalQty = (float) ManageStock::where('product_id', $pid)->sum('quantity');
                        if ($totalQty <= 0) { continue; }
                        $hpp = (float) ($prod->hpp ?? 0);
                        $lineAmt = (float) ($amountByProduct[$pid] ?? 0);
                        // remove prior effect: negative of (lineAmt - hpp * movedQty)
                        $deltaEffect = - ($lineAmt - ($hpp * $movedQty));
                        $newHpp = (($totalQty * $hpp) + $deltaEffect) / $totalQty;
                        $prod->update(['hpp' => (int) round($newHpp)]);
                    }
                }
            }

            // Revert HPP effect from shipping allocation (if any and transfer completed)
            $shipping = (float) ($transfer->shipping ?? 0);
            if ($transfer->status == \App\Models\Transfer::COMPLETED && $shipping > 0) {
                $items = $transfer->transferItems;
                $totalQtyMoved = max(0.0, (float) $items->sum('quantity'));
                if ($totalQtyMoved > 0) {
                    $perProductQty = [];
                    foreach ($items as $it) {
                        $perProductQty[$it->product_id] = ($perProductQty[$it->product_id] ?? 0) + (float) $it->quantity;
                    }
                    foreach ($perProductQty as $pid => $qtyMoved) {
                        /** @var Product $prod */
                        $prod = Product::find($pid);
                        if (! $prod) { continue; }
                        $oldQtyTotal = (float) ManageStock::where('product_id', $pid)->sum('quantity');
                        if ($oldQtyTotal <= 0) { continue; }
                        $oldHpp = (float) ($prod->hpp ?? 0);
                        $alloc = $shipping * ($qtyMoved / $totalQtyMoved);
                        // remove shipping effect
                        $newHpp = max(0, (($oldQtyTotal * $oldHpp) - $alloc) / $oldQtyTotal);
                        $prod->update(['hpp' => (int) round($newHpp)]);
                    }
                }
            }

            // Revert stock movement only if it was previously applied (completed)
            if ($transfer->status == \App\Models\Transfer::COMPLETED) {
            foreach ($transfer->transferItems as $transferItem) {
                $oldTransferItem = TransferItem::whereId($transferItem->id)->first();
                $oldTransfer = Transfer::whereId($oldTransferItem->transfer_id)->first();
                $fromManageStock = ManageStock::whereWarehouseId($oldTransfer->from_warehouse_id)->whereProductId($oldTransferItem->product_id)->first();
                $toManageStock = ManageStock::whereWarehouseId($oldTransfer->to_warehouse_id)->whereProductId($oldTransferItem->product_id)->first();

                $toquantity = 0;

                if ($toManageStock) {
                    $toquantity = $toquantity - $oldTransferItem->quantity;
                    manageStock($toManageStock->warehouse_id, $oldTransferItem->product_id, $toquantity);
                }

                $fromQuantity = 0;

                $fromQuantity = $fromQuantity + $oldTransferItem->quantity;

                manageStock($oldTransfer->from_warehouse_id, $oldTransferItem->product_id, $fromQuantity);
            }
            }

            $this->transferRepository->delete($id);

            DB::commit();

            return $this->sendSuccess('Transfer delete successfully');
        } catch (Exception $e) {
            DB::rollBack();
            throw new UnprocessableEntityHttpException($e->getMessage());
        }
    }
}
