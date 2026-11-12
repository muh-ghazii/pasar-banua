<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/**
 * Notifikasi dalam aplikasi (disimpan di tabel notifications).
 */
class AppNotification extends Notification
{
    public function __construct(
        private readonly string $title,
        private readonly string $message,
        private readonly ?string $url = null,
        private readonly string $tone = 'info',
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, string|null>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'url' => $this->url,
            'tone' => $this->tone,
        ];
    }
}
