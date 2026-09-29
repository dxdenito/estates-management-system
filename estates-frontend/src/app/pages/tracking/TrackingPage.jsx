
export default function TrackingPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Track Your Request</h2>
                <p className="text-gray-700">Enter your PF number to track the status of your request.</p>
                <form className="space-y-4">
                    <div>
                        <label htmlFor="pfNumber" className="block text-sm font-medium text-gray-700">PF Number</label>
                        <input type="text" id="pfNumber" name="pfNumber" required className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300" />
                    </div>
                    <button type="submit" className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-300">Track</button>
                </form>
            </div>
        </div>
    )
}
 