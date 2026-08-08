import React, { ImgHTMLAttributes } from 'react';

export default function ApplicationLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logo.svg"
            alt="Ba-Yu Logo"
            {...props}
        />
    );
}