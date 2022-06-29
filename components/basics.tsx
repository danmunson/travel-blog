/* eslint-disable @next/next/no-img-element */
import { Box, Modal, Paper, styled, SxProps, Typography } from "@mui/material";
import React, { HTMLAttributes } from "react";
import { ImageData } from "../lib/types";

export const ViewBox = styled(Box)({
    width: '80%'
});

export const EmptyDiv = styled('div')({
    margin: '0px',
    padding: '0px'
});

export const Base = styled('div')({
    flexDirection: 'column',
    alignContent: 'center',
});

export const StyledBackground = styled(Paper)({
    width: '80%',
    margin: 'auto',
    backgroundColor: '#B09E9B',
    padding: '15px'
});

export const ContentBase = ({title, children}: React.PropsWithChildren<{title: string}>) => {
    return (
        <Base>
            <Typography variant="h2" component="div" gutterBottom sx={{textAlign: 'center', fontFamily: 'Copperplate'}}>
                {title}
            </Typography>
            <StyledBackground>
                {children}
            </StyledBackground>
        </Base>
    );
}

type ImgStyles = HTMLAttributes<'img'>['style'];

export const BasicImage = ({image, width, className, style}: {image: ImageData, width: string, className?: string, style?: ImgStyles}) => {
    return (
        <img
            className={className}
            src={image.url}
            alt={image.name}
            width={width}
            loading="lazy"
            style={style}
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
