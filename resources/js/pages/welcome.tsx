import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { FileCheck, LogIn } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Selamat Datang" />
            <div className="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-900">
                <header className="w-full p-4 sm:p-6">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                <main className="flex flex-1 items-center justify-center p-6 lg:p-8">
                    <div className="w-full max-w-4xl text-center">
                        <div className="mb-8 flex justify-center">
                            <FileCheck className="h-24 w-24 text-gray-800 dark:text-white" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
                            Selamat Datang di Aplikasi Inspeksi
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            Solusi modern untuk mengelola dan melacak semua kebutuhan inspeksi Anda. Sederhanakan alur
                            kerja Anda, tingkatkan efisiensi, dan pastikan kepatuhan dengan mudah.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                <LogIn className="h-4 w-4" />
                                Mulai
                            </Link>
                            <a
                                href="#"
                                className="text-sm font-semibold leading-6 text-gray-900 transition-colors hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
                            >
                                Pelajari lebih lanjut <span aria-hidden="true">→</span>
                            </a>
                        </div>
                    </div>
                </main>
                <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>
                        Laravel v{usePage<SharedData>().props.laravelVersion} (PHP v
                        {usePage<SharedData>().props.phpVersion})
                    </p>
                </footer>
            </div>
        </>
    );
}