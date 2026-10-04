<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View
{
    $search = request('search');

    $users = User::query()

        ->when($search, function ($query) use ($search) {
            $query->where('nama', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('role', 'like', "%{$search}%");
        })

        ->latest()

        ->paginate(10)

        ->withQueryString();

    return view('users.index', compact('users'));
}
    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
{
    return view('users.create');
}

    /**
     * Store a newly created resource in storage.
     */
   public function store(StoreUserRequest $request): RedirectResponse
{
    $data = $request->validated();

    if ($request->hasFile('foto')) {
        $data['foto'] = $request->file('foto')->store('users', 'public');
    }

    User::create($data);

    return redirect()
        ->route('users.index')
        ->with('success', 'Data user berhasil ditambahkan.');
}

    /**
     * Display the specified resource.
     */
    public function show(User $user)
{
    abort(404);
}

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): View
{
    return view('users.edit', compact('user'));
}

    /**
     * Update the specified resource in storage.
     */
   public function update(UpdateUserRequest $request, User $user): RedirectResponse
{
    $data = $request->validated();

    // Upload foto baru
    if ($request->hasFile('foto')) {

        // Hapus foto lama
        if ($user->foto && Storage::disk('public')->exists($user->foto)) {
            Storage::disk('public')->delete($user->foto);
        }

        $data['foto'] = $request->file('foto')->store('users', 'public');
    }

    // Jika password kosong, jangan diubah
    if (empty($data['password'])) {
        unset($data['password']);
    }

    $user->update($data);

    return redirect()
        ->route('users.index')
        ->with('success', 'Data user berhasil diperbarui.');
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
{
    // Hapus foto jika ada
    if ($user->foto && Storage::disk('public')->exists($user->foto)) {
        Storage::disk('public')->delete($user->foto);
    }

    $user->delete();

    return redirect()
        ->route('users.index')
        ->with('success', 'Data user berhasil dihapus.');
}

}
