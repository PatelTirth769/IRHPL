import { useRouteError, Link } from 'react-router-dom';

const ErrorBoundary = () => {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Oops! Something went wrong</h2>
        <p className="text-gray-600">{error?.message || 'An unexpected error occurred.'}</p>
        <Link
          to="/"
          className="inline-block mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default ErrorBoundary;
