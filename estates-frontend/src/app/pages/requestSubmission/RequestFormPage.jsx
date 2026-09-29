
export default function RequestFormPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Request Submission</h2>
                <form className="space-y-4">
                    <div>
                        <label htmlFor="pfNumber" className="block text-sm font-medium text-gray-700">PF Number</label>
                        <input type="text" id="pfNumber" name="pfNumber" required className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300" />
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" id="name" name="name" required className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Institutional Email</label>
                        <input type="email" id="email" name="email" required className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300" />
                    </div>
                    <div>
                        <label htmlFor="phoneExtension" className="block text-sm font-medium text-gray-700">Phone Extension</label>
                        <input type="text" id="phoneExtension" name="phoneExtension" required className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300" />
                    </div> 
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input type="text" id="location" name="location" required className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" name="description" required className="w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300"></textarea>
                    </div>
                    <button type="submit" className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-300">Submit Request</button>
                </form>
            </div>
        </div>
    )
}