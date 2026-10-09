const NewsLetter = () => {
    
    return (
        <div className="mt-12 flex flex-col items-center justify-center space-y-2 pb-10 text-center sm:mt-24 sm:pb-14">
            <h1 className="text-2xl font-semibold sm:text-3xl md:text-4xl">Never Miss a Deal!</h1>
            <p className="px-2 pb-5 text-sm text-gray-500/70 sm:pb-8 sm:text-base md:text-lg">
                Subscribe to get the latest offers, new arrivals, and exclusive discounts
            </p>
            <form className="flex h-11 w-full max-w-2xl items-center justify-between sm:h-13">
                <input
                    className="border border-gray-300 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500"
                    type="text"
                    placeholder="Enter your email id"
                    required
                />
                <button type="submit" className="h-full rounded-md rounded-l-none bg-primary px-5 text-sm text-white transition-all hover:bg-primary-dull sm:px-8 md:px-12">
                    Subscribe
                </button>
            </form>
        </div>
    )
}

export default NewsLetter