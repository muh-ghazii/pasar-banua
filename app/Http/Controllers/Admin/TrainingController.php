<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TrainingRequest;
use App\Models\TrainingMaterial;
use App\Models\User;
use App\Support\Slug;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TrainingController extends Controller
{
    public function index(): Response
    {
        $sellers = User::where('role', Role::Seller)->count();

        // Hanya progres milik pelaku UMKM yang dihitung.
        $materials = TrainingMaterial::query()
            ->withCount(['completedBy as completed_count' => fn ($q) => $q->where('users.role', Role::Seller->value)])
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (TrainingMaterial $m) => [
                ...$this->payload($m),
                'completed_count' => (int) $m->completed_count,
                'completion_rate' => $sellers > 0 ? round($m->completed_count / $sellers * 100) : 0,
            ]);

        return Inertia::render('admin/training-index', [
            'materials' => $materials,
            'sellers' => $sellers,
            'topics' => TrainingRequest::TOPICS,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/training-form', [
            'material' => null,
            'topics' => TrainingRequest::TOPICS,
            'nextOrder' => (int) TrainingMaterial::max('sort_order') + 1,
        ]);
    }

    public function store(TrainingRequest $request): RedirectResponse
    {
        $data = $request->validated();

        TrainingMaterial::create([
            ...$data,
            'slug' => Slug::unique(TrainingMaterial::class, $data['title']),
            'sort_order' => $data['sort_order'] ?? 0,
            'is_published' => $request->boolean('is_published'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Materi pelatihan ditambahkan.']);

        return to_route('admin.training.index');
    }

    public function edit(TrainingMaterial $training): Response
    {
        return Inertia::render('admin/training-form', [
            'material' => [...$this->payload($training), 'content' => $training->content],
            'topics' => TrainingRequest::TOPICS,
            'nextOrder' => $training->sort_order,
        ]);
    }

    public function update(TrainingRequest $request, TrainingMaterial $training): RedirectResponse
    {
        $data = $request->validated();

        $training->update([
            ...$data,
            'slug' => $training->title === $data['title'] ? $training->slug : Slug::unique(TrainingMaterial::class, $data['title'], $training->id),
            'sort_order' => $data['sort_order'] ?? 0,
            'is_published' => $request->boolean('is_published'),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Materi pelatihan diperbarui.']);

        return to_route('admin.training.index');
    }

    public function togglePublished(TrainingMaterial $training): RedirectResponse
    {
        $training->update(['is_published' => ! $training->is_published]);

        Inertia::flash('toast', ['type' => 'success', 'message' => $training->is_published ? 'Materi diterbitkan.' : 'Materi disimpan sebagai draf.']);

        return back();
    }

    public function destroy(TrainingMaterial $training): RedirectResponse
    {
        $training->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Materi \"{$training->title}\" dihapus."]);

        return to_route('admin.training.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(TrainingMaterial $m): array
    {
        return [
            'id' => $m->id,
            'title' => $m->title,
            'slug' => $m->slug,
            'topic' => $m->topic,
            'topic_label' => TrainingRequest::TOPICS[$m->topic] ?? $m->topic,
            'summary' => $m->summary,
            'duration_minutes' => $m->duration_minutes,
            'sort_order' => $m->sort_order,
            'is_published' => $m->is_published,
            'updated_at' => $m->updated_at?->toIso8601String(),
        ];
    }
}
