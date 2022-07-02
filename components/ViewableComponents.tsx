/* eslint-disable @next/next/no-img-element */
import { ImageList, ImageListItem, Typography } from "@mui/material";
import React from "react";
import { ImageData } from "../lib/types";
import { ExpandedImageModal } from "./Modals";
import { ClickableImage, EmptyDiv } from "./basics";
import { paragraphFontFamily } from "../lib/styling";

const pgStyles = {
    fontFamily: paragraphFontFamily,
    fontSize: '20px'
}

export function ViewableParagraph({text}: {text: string}) {
    return (
        <Typography variant="body1" sx={{whiteSpace: 'pre-line', ...pgStyles}}>
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
                        <ClickableImage image={image} asCompressed={true}/>
                    </ImageListItem>
                ))}
            </ImageList>
            {ExpandedImageModal(expandedImage, () => setExpandedImage(null))}
        </EmptyDiv>
    );
}