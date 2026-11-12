<?php

namespace App\Http\Controllers\Seller;

use App\Enums\UmkmStatus;
use App\Http\Requests\Seller\UmkmProfileRequest;
use App\Services\ImageStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends SellerController
{
    public function edit(Request $request): Response
    {
        $umkm = $this->umkm($request);
        $this->authorize('update', $umkm);

        return Inertia::render('seller/profile', [
            'umkm' => [
                'name' => $umkm->name,
                'slug' => $umkm->slug,
                'tagline' => $umkm->tagline,
                'description' => $umkm->description,
                'story' => $umkm->story,
                'city' => $umkm->city,
                'address' => $umkm->address,
                'phone' => $umkm->phone,
                'whatsapp' => $umkm->whatsapp,
                'instagram' => $umkm->instagram,
                'logo_url' => $umkm->logoUrl(),
                'cover_url' => $umkm->coverUrl(),
                'status' => $umkm->status->value,
                'status_label' => $umkm->status->label(),
                'rejection_reason' => $umkm->rejection_reason,
                'verified_at' => $umkm->verified_at?->toIso8601String(),
                'is_demo' => $umkm->is_demo,
            ],
            'maxImageMb' => round(config('pasarbanua.uploads.max_image_kb') / 1024, 1),
        ]);
    }

    public function update(UmkmProfileRequest $request, ImageStorage $images): RedirectResponse
    {
        $umkm = $this->umkm($request);
        $data = $request->validated();
        $toDelete = [];

        foreach (['logo' => 'logo_path', 'cover' => 'cover_path'] as $field => $column) {
            if ($request->hasFile($field)) {
                $toDelete[] = $umkm->{$column};
                $umkm->{$column} = $images->store($request->file($field), "umkm/{$umkm->id}");
            } elseif ($request->boolean("remove_{$field}")) {
                $toDelete[] = $umkm->{$column};
                $umkm->{$column} = null;
            }
        }

        // Slug sengaja tidak diubah agar tautan toko yang sudah dibagikan tetap berlaku.
        $umkm->fill([
            'name' => $data['name'],
            'tagline' => $data['tagline'] ?? null,
            'description' => $data['description'] ?? null,
            'story' => $data['story'] ?? null,
            'city' => $data['city'],
            'address' => $data['address'] ?? null,
            'phone' => $data['phone'],
            'whatsapp' => $data['whatsapp'] ?? null,
            'instagram' => isset($data['instagram']) ? ltrim($data['instagram'], '@') : null,
        ]);

        // UMKM yang ditolak dapat memperbaiki profil lalu diajukan ulang untuk verifikasi.
        $resubmitted = false;

        if ($umkm->status === UmkmStatus::Rejected) {
            $umkm->status = UmkmStatus::Pending;
            $umkm->rejection_reason = null;
            $resubmitted = true;
        }

        $umkm->save();

        foreach (array_filter($toDelete) as $path) {
            $images->delete($path);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $resubmitted
                ? 'Profil diperbarui dan diajukan ulang untuk verifikasi admin.'
                : 'Profil UMKM berhasil diperbarui.',
        ]);

        return to_route('seller.profile.edit');
    }
}
