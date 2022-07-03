/* eslint-disable @next/next/no-img-element */
import * as React from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Button from '@mui/material/Button';
import { ArticleItem, EditState, ImageData } from '../lib/types';
import {ControlPanel, EditableExpandedImageModal} from './Modals';
import { ButtonGroup, Divider, Modal, Stack } from '@mui/material';
import {v4 as uuid} from 'uuid';
import { BasicStyledBox, ClickableImage } from './basics';

type ParagraphItem = ArticleItem & {type: 'paragraph'};
type SlideshowItem = ArticleItem & {type: 'slideshow'};

export function NewParagraph(item: ParagraphItem) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        item.paragraph = event.target.value;
    };

    return (
        <div style={{width: '1000px'}}>
            <TextField
                id="outlined-textarea"
                label="New Paragraph"
                placeholder="Placeholder"
                multiline
                minRows={2}
                onChange={handleChange}
                defaultValue={item.paragraph || ''}
                fullWidth
            />
        </div>
    );
}

function UploadButton(
    item: ArticleItem,
    inputRef: React.MutableRefObject<any>,
    itemIdRef: React.MutableRefObject<string|null>,
) {
    return (<>
        <Button
            variant="outlined"
            onClick={() => {
                itemIdRef.current = item.id;
                inputRef!.current?.click();
            }}
        >
            Upload
        </Button>
    </>);
}

function HiddenImageInput(
    inputRef: React.MutableRefObject<any>,
    itemIdRef: React.MutableRefObject<string|null>,
    handleImages: (id: string, imageData: ImageData[]) => void
) {
    return (<>
        <input
            type="file"
            id="fileElem"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            ref={inputRef}
            onChange={(event) => {
                const files = event.target.files;
                const fileData = [];
                if (files && files.length) {
                    for (let i = 0; i < files.length; i++) {
                        const file = files.item(i);
                        if (file) {
                            fileData.push({
                                url: URL.createObjectURL(file),
                                name: file.name,
                                size: file.size,
                            });
                        }
                    }
                }
                if (fileData.length) {
                    const id = itemIdRef.current!;
                    handleImages(id, fileData);
                }
            }}
        />
    </>);
}

const MemoizedImageListItem = React.memo(ImageListItem);

export function MasonryImageListUpload(
    item: SlideshowItem,
    setExpandedImage: (imageData: ImageData) => void,
    inputRef: React.MutableRefObject<any>,
    itemIdRef: React.MutableRefObject<string|null>,
) {
    return (<>
        <Box sx={{ width: 1000, overflowY: 'scroll' }}>
            <ImageList variant="masonry" cols={3} gap={8}>
                {item.images.map((image) => (
                    <MemoizedImageListItem key={image.url} onClick={() => setExpandedImage(image)}>
                        <ClickableImage
                            image={image}
                            asCompressed={image.url.indexOf('/api/image/') >= 0} // only used compressed if image is on server
                        />
                    </MemoizedImageListItem>
                ))}
            </ImageList>
        </Box>
        {UploadButton(item, inputRef, itemIdRef)}
    </>);
}

type Controls = {
    insertNewParagraph: () => void;
    insertNewImageSet: () => void;
    deleteItem: (id: string) => void;
    moveUpwards: (id: string) => void;
    moveDownwards: (id: string) => void;
    addImages: (id: string, image: ImageData[]) => void;
    removeImage: (id: string, imageUrl: string) => void;
};

function makeControls(
    editState: EditState,
    setCurrentState: (editState: EditState) => void,
): Controls {
    const {articleState, articleOrder} = editState;
    return {
        insertNewParagraph: () => {
            // adds paragraph to end of article
            const id = uuid();
            const item: ParagraphItem = {id, paragraph: '', type: 'paragraph'};
            articleState[id] = item;
            articleOrder.push(id);
            setCurrentState({articleState, articleOrder});
        },

        insertNewImageSet: () => {
            // adds paragraph to end of article
            const id = uuid();
            const item: SlideshowItem = {id, images: [], type: 'slideshow'};
            articleState[id] = item;
            articleOrder.push(id);
            setCurrentState({articleState, articleOrder});
        },

        deleteItem: (idToDelete: string) => {
            delete articleState[idToDelete];
            const newOrder = articleOrder.filter((x) => x !== idToDelete);
            setCurrentState({articleState, articleOrder: newOrder});
        },

        moveUpwards: (idOfCallingItem: string) => {
            const targetIdx = articleOrder.findIndex((x) => x === idOfCallingItem);
            if (targetIdx && targetIdx > 0) {
                const targetId = articleOrder[targetIdx];
                const temp = articleOrder[targetIdx - 1];
                articleOrder[targetIdx] = temp;
                articleOrder[targetIdx - 1] = targetId;
            }
            setCurrentState({articleState, articleOrder});
        },

        moveDownwards: (idOfCallingItem: string) => {
            const targetIdx = articleOrder.findIndex((x) => x === idOfCallingItem);
            if (targetIdx > -1 && targetIdx < articleOrder.length - 1) {
                const targetId = articleOrder[targetIdx];
                const temp = articleOrder[targetIdx + 1];
                articleOrder[targetIdx] = temp;
                articleOrder[targetIdx + 1] = targetId;
            }
            setCurrentState({articleState, articleOrder});
        },

        addImages: (idOfCallingItem: string, images: ImageData[]) => {
            const item = articleState[idOfCallingItem] as SlideshowItem;
            item.images = item.images.concat(images);
            setCurrentState({articleState, articleOrder});
        },

        removeImage: (idOfCallingItem: string, imageUrl: string) => {
            const item = articleState[idOfCallingItem] as SlideshowItem;
            item.images = item.images.filter((image) => image.url !== imageUrl);
            URL.revokeObjectURL(imageUrl);
            setCurrentState({articleState, articleOrder});
        },
    };
}

function ElementWithControls<T extends {id: string}>(
    item: T,
    element: JSX.Element,
    openControls: (item: T) => void,
) {
    return (
        <Box>
            {element}
            <Button onClick={() => openControls(item)}>Edit</Button>
        </Box>
    );
};



export function ContentCreationGroup(
    editState: EditState,
    updateEditState: (editState: EditState) => void,
    upload: (editState: EditState) => void,
) {
    const [selectedItem, setSelectedItem] = React.useState(null as ArticleItem|null);

    const [selectedImage, setSelectedImage] = React.useState(
        null as {id: string, image: ImageData}|null
    );

    const imageInputRef = React.useRef(null as any);
    const imageItemIdRef = React.useRef(null as string|null);

    const controls = makeControls(
        editState,
        (editState: EditState) => {
            const {articleState, articleOrder} = editState;
            updateEditState({articleState, articleOrder: articleOrder.slice()});
        }
    );
    const {
        insertNewParagraph,
        insertNewImageSet,
        deleteItem,
        moveUpwards,
        moveDownwards,
        addImages,
        removeImage,
    } = controls;

    const mapContentToComponent = (item: ArticleItem) => {
        const type = item.type;
        if (type === 'paragraph') {
            return ElementWithControls(
                item,
                NewParagraph(item),
                setSelectedItem
            );
        } else if (type === 'slideshow') {
            return ElementWithControls(
                item,
                MasonryImageListUpload(
                    item,
                    (image: ImageData) => setSelectedImage({id: item.id, image}),
                    imageInputRef,
                    imageItemIdRef,
                ),
                setSelectedItem
            );
        }
        // TODO: video
    }

    return (<>
        <Stack 
            spacing={4}
            divider={<Divider orientation="horizontal" flexItem />}
        >
            {editState.articleOrder.map((itemId) => editState.articleState[itemId]).map((item) => {
                return <div key={item.id}>{mapContentToComponent(item)}</div>;
            })}
        </Stack>
        <BasicStyledBox>
            <ButtonGroup>
                <Button onClick={() => insertNewParagraph()}>New Paragraph</Button>
                <Button onClick={() => insertNewImageSet()}>New Slideshow</Button>
                <Button onClick={() => upload(editState)}>Save</Button>
            </ButtonGroup>
            {
                ControlPanel(
                    selectedItem,
                    () => setSelectedItem(null),
                    deleteItem,
                    moveUpwards,
                    moveDownwards,
                )
            }
            {
                EditableExpandedImageModal(
                    selectedImage?.image,
                    () => setSelectedImage(null),
                    (url: string) => removeImage(selectedImage!.id, url),
                )
            }
            {
                HiddenImageInput(
                    imageInputRef,
                    imageItemIdRef,
                    addImages,
                )
            }
        </BasicStyledBox>
    </>);

}