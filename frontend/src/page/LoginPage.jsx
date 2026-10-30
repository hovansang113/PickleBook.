import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {Link} from "react-router-dom";
import useAuthStore from '../features/auth/useAuthStore';
import Label from '../components/Label';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthLayout from '../components/AuthLayout';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;
    const navigate = useNavigate();
    const { user, isLoading, isError, isSuccess, message, login, reset } = useAuthStore();

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isSuccess || user) {
            navigate(user?.role === 'ADMIN' ? '/admin' : '/');
        }
        reset();
    }, [user, isError, isSuccess, message, navigate, reset]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        login({ email, password });
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-tertiary">
                    SangPickle
                </span>
                <h1 className="mt-2 mb-3 text-3xl font-semibold">Chào mừng đã quay trở lại</h1>
                <p className="mb-8 text-sm text-neutral-500">
                    Đăng nhập để tiếp tục đặt sân, theo dõi điểm thưởng và trải nghiệm sân chơi của bạn.
                </p>
                <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            placeholder="Nhập mật khẩu"
                            autoComplete="new-password"
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="mt-2">
                        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                </form>
                <p className="mt-8 text-center text-sm text-neutral-500">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="font-medium text-primary hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default LoginPage;
