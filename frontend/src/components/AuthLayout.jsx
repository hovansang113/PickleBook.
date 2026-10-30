import courtImg from '../assets/unnamed.png';

export default function AuthLayout({ children }) {
    return (
        <div className="grid h-full grid-cols-1 bg-background md:grid-cols-[1fr_1fr]">
            <div className="hidden md:block">
                <img
                    src={courtImg}
                    alt=""
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="flex items-center justify-center px-6 py-12">
                {children}
            </div>
        </div>
    );
}
