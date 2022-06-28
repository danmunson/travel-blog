/* eslint-disable @next/next/no-img-element */
import { ImageList, ImageListItem, styled, Typography } from "@mui/material";
import React from "react";
import { ImageData } from "../lib/types";
import { ExpandedImageModal } from "./Modals";
import { ClickableImage, ViewBox, EmptyDiv } from "./basics";

export function ViewableParagraph({text}: {text: string}) {
    return (
        <Typography variant="body1">
            {text}
        </Typography>
    );
}

export function ViewableImages({images}: {images: ImageData[]}) {
    const [expandedImage, setExpandedImage] = React.useState(null as ImageData|null);
    return (
        <EmptyDiv>
            <ImageList variant="masonry" cols={3} gap={10}>
                {images.map((image) => (
                    <ImageListItem key={image.url} onClick={() => setExpandedImage(image)}>
                        <ClickableImage image={image} width={'250px'}/>
                    </ImageListItem>
                ))}
            </ImageList>
            {ExpandedImageModal(expandedImage, () => setExpandedImage(null))}
        </EmptyDiv>
    );
}