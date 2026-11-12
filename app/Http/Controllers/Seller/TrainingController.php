<?php

namespace App\Http\Controllers\Seller;

use App\Models\TrainingMaterial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TrainingController extends SellerController
{
    public function index(Request $request): Response
    {
        $completed = $request->user()->completedTrainings()->pluck('training_materials.id')->all();

        $materials = TrainingMaterial::published()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (TrainingMaterial $m) => [
                'id' => $m->id,
                'title' => $m->title,
                'slug' => $m->slug,
                'topic' => $m->topic,
                'summary' => $m->summary,
                'duration_minutes' => $m->duration_minutes,
                'completed' => in_array($m->id, $completed, true),
            ]);

        return Inertia::render('seller/training/index', [
            'materials' => $materials->all(),
            'progress' => [
                'completed' => $materials->where('completed', true)->count(),
                'total' => $materials->count(),
            ],
        ]);
    }

    public function show(Request $request, TrainingMaterial $training): Response
    {
        abort_unless($training->is_published, 404);

        $all = TrainingMaterial::published()->orderBy('sort_order')->orderBy('id')->get(['id', 'title', 'slug']);
        $index = $all->search(fn ($m) => $m->id === $training->id);
        $completedAt = $request->user()->completedTrainings()->whereKey($training->id)->first()?->pivot?->completed_at;

        $link = fn ($m) => $m ? ['title' => $m->title, 'slug' => $m->slug] : null;

        return Inertia::render('seller/training/show', [
            'material' => [
                'id' => $training->id,
                'title' => $training->title,
                'slug' => $training->slug,
                'topic' => $training->topic,
                'summary' => $training->summary,
                'content' => $training->content,
                'duration_minutes' => $training->duration_minutes,
                'completed_at' => $completedAt ? Carbon::parse($completedAt)->toIso8601String() : null,
            ],
            'position' => ['index' => $index + 1, 'total' => $all->count()],
            'previous' => $link($index > 0 ? $all[$index - 1] : null),
            'next' => $link($all[$index + 1] ?? null),
        ]);
    }

    public function complete(Request $request, TrainingMaterial $training): RedirectResponse
    {
        abort_unless($training->is_published, 404);

        $request->user()->completedTrainings()->syncWithoutDetaching([
            $training->id => ['completed_at' => now()],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Materi \"{$training->title}\" ditandai selesai."]);

        return back();
    }
}
