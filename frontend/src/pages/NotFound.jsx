import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-8xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-3xl font-semibold text-gray-800">Page not found</h1>
      <p className="mt-3 max-w-md text-gray-500">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-dull"
      >
        Back to Home
      </Link>
    </main>
  );
};

export default NotFound;
