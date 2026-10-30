import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../features/auth/useAuthStore';
import Label from '../components/Label';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthLayout from '../components/AuthLayout';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        password2: '',
    });

    const { name, email, phone, password, password2 } = formData;

    const navigate = useNavigate();
    const { user, isLoading, isError, isSuccess, message, register, reset } = useAuthStore();

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isSuccess || user) {
            navigate('/login');
        }
        reset();

    }, [user, isError, isSuccess, message, navigate, reset]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (password !== password2) {
            toast.error('Passwords do not match');
        } else {
            const userData = {
                username: name,
                email,
                phone,
                password,
            };
            register(userData);
        }
    };
    return (
        <AuthLayout>
            <div className="w-full max-w-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-tertiary">
                    SangPickle
                </span>
                <h1 className="mt-2 mb-3 text-3xl font-semibold">Tạo tài khoản</h1>
                <p className="mb-8 text-sm text-neutral-500">
                    Tham gia cộng đồng Terra Pickleball để đặt sân, tích điểm thưởng và kết nối với người chơi khác.
                </p>
                <form onSubmit={onSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="name">Họ tên</Label>
                        <Input
                            id="name"
                            type="text"
                            name="name"
                            value={name}
                            onChange={onChange}
                            placeholder="Nguyễn Văn A"
                            autoComplete="off"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder="email@vidu.com"
                            autoComplete="off"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={phone}
                            onChange={onChange}
                            placeholder="0901234567"
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            placeholder="Tối thiểu 8 ký tự"
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password2">Nhập lại mật khẩu</Label>
                        <Input
                            id="password2"
                            type="password"
                            name="password2"
                            value={password2}
                            onChange={onChange}
                            placeholder="Nhập lại mật khẩu"
                            autoComplete="new-password"
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="mt-2">
                        {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                    </Button>
                </form>
                <p className="mt-8 text-center text-sm text-neutral-500">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="font-medium text-primary hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default RegisterPage;
