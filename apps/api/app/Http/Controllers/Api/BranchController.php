<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Branch;

class BranchController extends Controller
{
    public function index()
    {
        return response()->json(Branch::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'is_active' => 'boolean'
        ]);

        $branch = Branch::create([
            'company_id' => $request->user()->company_id,
            'name' => $request->name,
            'location' => $request->location,
            'phone' => $request->phone,
            'is_active' => $request->is_active ?? true
        ]);

        return response()->json(['message' => 'Branch created successfully', 'branch' => $branch], 201);
    }

    public function update(Request $request, Branch $branch)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'is_active' => 'boolean'
        ]);

        $branch->update($request->only(['name', 'location', 'phone', 'is_active']));

        return response()->json(['message' => 'Branch updated successfully', 'branch' => $branch]);
    }

    public function destroy(Branch $branch)
    {
        $branch->delete();
        return response()->json(['message' => 'Branch deleted successfully']);
    }
}
