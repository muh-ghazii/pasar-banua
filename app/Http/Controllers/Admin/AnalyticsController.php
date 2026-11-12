<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function __invoke(AnalyticsService $analytics): Response
    {
        return Inertia::render('admin/analytics', [
            'totals' => $analytics->totals(),
            'kpis' => $analytics->kpis(),
            'trend' => $analytics->monthlyTrend(12),
            'categories' => $analytics->popularCategories(),
            'topUmkm' => $analytics->topUmkm(),
            'statuses' => $analytics->statusDistribution(),
            'ratings' => $analytics->ratingDistribution(),
        ]);
    }
}
