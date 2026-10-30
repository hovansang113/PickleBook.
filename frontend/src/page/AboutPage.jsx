import { Link } from 'react-router-dom';
import courtImg from '../assets/unnamed.png';

const AboutPage = () => {
    return (
        <div className="bg-background">
            {/* Hero */}
            <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 lg:grid-cols-2">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-tertiary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-tertiary">
                        🌱 Rooted In Play
                    </span>
                    <h1 className="mt-4 font-headline text-4xl font-bold text-neutral-900">
                        Nơi đam mê <span className="italic text-primary">chạm đất.</span>
                    </h1>
                    <p className="mt-4 text-neutral-600">
                        Terra Pickleball không chỉ là những sân đấu. Chúng tôi là một cộng đồng
                        gắn kết bởi niềm vui vận động, không gian hữu cơ và sự ấm áp của tinh
                        thần thể thao nguyên bản.
                    </p>
                    <div className="mt-6 flex gap-3">
                        <Link
                            to="/courts"
                            className="rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover"
                        >
                            Khám phá Cơ sở
                        </Link>
                        <a
                            href="#contact"
                            className="rounded-xl border border-outline bg-background px-6 py-3 font-semibold text-neutral-700 hover:bg-neutral-100"
                        >
                            Liên hệ
                        </a>
                    </div>
                </div>
                <div className="relative overflow-hidden rounded-xl">
                    <img src={courtImg} alt="" className="h-80 w-full object-cover" />
                    <div className="absolute bottom-4 left-4 rounded-xl bg-background/95 p-4 shadow-soft">
                        <p className="font-semibold text-neutral-900">Cơ sở vật chất</p>
                        <p className="text-sm text-neutral-500">
                            12 sân tiêu chuẩn với chất liệu mặt sàn cao cấp.
                        </p>
                    </div>
                </div>
            </section>

            {/* Tầm nhìn & Sứ mệnh */}
            <section className="mx-auto max-w-6xl px-4 py-12 text-center">
                <h2 className="font-headline text-2xl font-semibold text-neutral-900">
                    Tầm nhìn & Sứ mệnh
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-neutral-500">
                    Chúng tôi xây dựng Terra dựa trên những giá trị cốt lõi, mang thiên nhiên
                    vào từng nhịp đập của trò chơi.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-4 text-left lg:grid-cols-2">
                    <div className="relative overflow-hidden rounded-xl">
                        <img src={courtImg} alt="" className="h-full min-h-[280px] w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 text-white">
                            <span className="text-2xl">🤝</span>
                            <p className="mt-2 text-lg font-semibold">Gắn kết Cộng đồng</p>
                            <p className="mt-1 max-w-xs text-sm text-white/80">
                                Tạo ra không gian nơi mọi người, từ người mới bắt đầu tới chuyên
                                nghiệp, đều cảm thấy chào đón và thuộc về.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-xl border border-outline bg-neutral-50 p-6">
                            <span className="text-2xl">☀️</span>
                            <p className="mt-2 font-semibold text-neutral-900">Sức khỏe Bền vững</p>
                            <p className="mt-1 text-sm text-neutral-500">
                                Thúc đẩy lối sống năng động, cân bằng thể chất và tinh thần trong
                                một môi trường trong lành, thư giãn.
                            </p>
                        </div>
                        <div className="rounded-xl border border-outline bg-neutral-50 p-6">
                            <span className="text-2xl">🏆</span>
                            <p className="mt-2 font-semibold text-neutral-900">Trải nghiệm Đỉnh cao</p>
                            <p className="mt-1 text-sm text-neutral-500">
                                Đầu tư cơ sở vật chất cao cấp nhất để đảm bảo mỗi trận đấu đều
                                hoàn hảo.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tiện ích nội khu */}
            <section className="mx-auto max-w-6xl px-4 py-12">
                <h2 className="text-center font-headline text-2xl font-semibold text-neutral-900">
                    Tiện ích Nội khu
                </h2>

                <div className="mt-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                    <img src={courtImg} alt="" className="h-64 w-full rounded-xl object-cover" />
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
                            ⊞ Hệ thống sân
                        </span>
                        <h3 className="mt-2 font-headline text-xl font-semibold text-neutral-900">
                            12 Sân Tiêu Chuẩn Quốc Tế
                        </h3>
                        <p className="mt-2 text-neutral-600">
                            Mặt sân được thiết kế đặc biệt giảm chấn thương, kết hợp hệ thống
                            chiếu sáng chống chói. Không gian rộng rãi, thoáng đãng với tông màu
                            kem và xanh lá dịu mắt, giúp bạn tập trung hoàn toàn vào từng đường
                            bóng.
                        </p>
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                    <div className="lg:order-2">
                        <img src={courtImg} alt="" className="h-64 w-full rounded-xl object-cover" />
                    </div>
                    <div className="lg:order-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-tertiary">
                            ☕ Thư giãn
                        </span>
                        <h3 className="mt-2 font-headline text-xl font-semibold text-neutral-900">
                            Terra Cafe & Lounge
                        </h3>
                        <p className="mt-2 text-neutral-600">
                            Nơi hoàn hảo để nạp lại năng lượng sau trận đấu. Thưởng thức đồ uống
                            tốt cho sức khỏe trong không gian thiết kế mở, ngập tràn ánh sáng tự
                            nhiên và cây xanh. Nơi những câu chuyện được chia sẻ và tình bạn được
                            ươm mầm.
                        </p>
                    </div>
                </div>
            </section>

            {/* Liên hệ */}
            <section id="contact" className="mx-auto max-w-6xl px-4 py-12">
                <div className="rounded-xl border border-outline bg-neutral-50 p-8 text-center">
                    <h2 className="font-headline text-2xl font-semibold text-neutral-900">
                        Liên hệ với chúng tôi
                    </h2>
                    <div className="mx-auto mt-6 flex max-w-xl flex-col gap-2 text-sm text-neutral-600">
                        <p>📍 123 Đường Mộc Lan, Quận 2, Thành phố Hồ Chí Minh, Việt Nam</p>
                        <p>
                            ✉️{' '}
                            <a href="mailto:hello@terrapickleball.vn" className="text-primary hover:underline">
                                hello@terrapickleball.vn
                            </a>
                        </p>
                        <p>
                            📞{' '}
                            <a href="tel:0901234567" className="text-primary hover:underline">
                                090 123 4567
                            </a>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
