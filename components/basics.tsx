/* eslint-disable @next/next/no-img-element */
import { Box, Modal, Paper, styled, Typography } from "@mui/material";
import React, { HTMLAttributes } from "react";
import { contentBaseBg, titleFontFamily, universalBg } from "../lib/styling";
import { compressedUrl } from "../lib/endpoints";
import { ImageData } from "../lib/types";

export const ViewBox = styled(Box)({
    width: '80%',
});

export const EmptyDiv = styled('div')({
    margin: '0px',
    padding: '0px'
});

export const Base = styled('div')({
    flexDirection: 'column',
    alignContent: 'center',
    backgroundColor: universalBg,
    paddingTop: '20px',
    height: '100%'
});

export const StyledBackground = styled(Paper)({
    width: '80%',
    margin: 'auto',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: contentBaseBg,
});

export const ContentBase = ({title, children}: React.PropsWithChildren<{title: string}>) => {
    return (
        <Base>
            <Typography variant="h2" component="div" gutterBottom sx={{textAlign: 'center', fontFamily: titleFontFamily}}>
                {title}
            </Typography>
            <StyledBackground elevation={5}>
                {children}
            </StyledBackground>
        </Base>
    );
}

type ImgStyles = HTMLAttributes<'img'>['style'];
type ImgParams = {
    image: ImageData,
    className?: string,
    style?: ImgStyles,
    asCompressed?: boolean,
    onLoad?: () => void,
};

export const BasicImage = ({image, className, style, asCompressed, onLoad}: ImgParams) => {
    const url = asCompressed ? compressedUrl(image.url) : image.url;
    const cb = onLoad || (() => {});
    return (
        <img
            className={className}
            src={url}
            alt={image.name}
            loading="lazy"
            style={{...style, maxWidth: '100%', maxHeight: '100%'}}
            onLoad={cb}
        />
    );
}

export const ClickableImage = styled(BasicImage)({
    cursor: 'pointer',
});

const modalStyles = {
    margin: 'auto',
    width: '80%',
    height: '80%',
};

export const BasicStyledModal = styled(Modal)(modalStyles);

export const CenteredContentsStyle = {
    justifyItems: 'center',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    display: 'flex',
};

export const BasicStyledBox = styled(Box)(CenteredContentsStyle);
