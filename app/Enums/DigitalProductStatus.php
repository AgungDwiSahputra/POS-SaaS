<?php

namespace App\Enums;

enum DigitalProductStatus: string
{
    case PENDING = 'pending';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
    case CANCELLED = 'cancelled';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';

    /**
     * Get all status values
     */
    public static function values(): array
    {
        return [
            self::PENDING,
            self::COMPLETED,
            self::FAILED,
            self::CANCELLED,
            self::APPROVED,
            self::REJECTED,
        ];
    }

    /**
     * Get status label for display
     */
    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Menunggu',
            self::COMPLETED => 'Selesai',
            self::FAILED => 'Gagal',
            self::CANCELLED => 'Dibatalkan',
            self::APPROVED => 'Disetujui',
            self::REJECTED => 'Ditolak',
        };
    }

    /**
     * Get status badge class for UI
     */
    public function badgeClass(): string
    {
        return match($this) {
            self::PENDING => 'badge bg-warning',
            self::COMPLETED => 'badge bg-success',
            self::FAILED => 'badge bg-danger',
            self::CANCELLED => 'badge bg-secondary',
            self::APPROVED => 'badge bg-info',
            self::REJECTED => 'badge bg-danger',
        };
    }

    /**
     * Check if status is final (cannot be changed)
     */
    public function isFinal(): bool
    {
        return in_array($this, [
            self::COMPLETED,
            self::FAILED,
            self::CANCELLED,
            self::REJECTED,
        ]);
    }

    /**
     * Check if status allows approval workflow
     */
    public function allowsApproval(): bool
    {
        return in_array($this, [
            self::PENDING,
            self::APPROVED,
        ]);
    }
}