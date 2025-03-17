// Middleware to handle 403 responses and redirect to login
export const handle403Redirect = async (response: Response) => {
    if (response.status === 403) {
        window.location.href = '/login'; // Redirect to login screen
        throw new Error('Unauthorized access - redirected to login');
    }
    return response;
};
