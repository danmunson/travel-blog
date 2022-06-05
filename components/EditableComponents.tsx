import * as React from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Image from 'next/image';
import Button from '@mui/material/Button';
import { ArticleItem, ImageData } from '../lib/types';
import {EditableExpandedImageModal} from './Modals';
import { ButtonGroup, Modal } from '@mui/material';
import {v4 as uuid} from 'uuid';

type ParagraphItem = ArticleItem & {type: 'paragraph'};
type SlideshowItem = ArticleItem & {type: 'slideshow'};

export function NewParagraph(item: ParagraphItem) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        item.paragraph = event.target.value;
    };

    return (
        <div>
            <TextField
                id="outlined-textarea"
                label="New Paragraph"
                placeholder="Placeholder"
                multiline
                minRows={2}
                onChange={handleChange}
                defaultValue={item.paragraph || ''}
            />
        </div>
    );
}

function UploadButton(setValue: (imageData: ImageData[]) => void) {
    const inputRef = React.useRef(null);
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
                    setValue(fileData);
                }
            }}
        ></input>
        <Button
            variant="outlined"
            onClick={() => {
                // "click" the input
                console.log('CLICKING', inputRef.current);
                (inputRef.current as any)?.click();
            }}
        >
            Upload
        </Button>
    </>);
}

const MemoizedImage = React.memo(Image);

export function MasonryImageListUpload(item: SlideshowItem) {
    const [imageData, _setImageData] = React.useState([] as ImageData[]);

    const setImageData = (imageData: ImageData[]) => {
        item.images = imageData;
        _setImageData(item.images);
    }

    const addMore = (moreImageData: ImageData[]) => {
        const allImageData = imageData.concat(moreImageData);
        setImageData(allImageData);
    }

    const removeImage = (imageUrl: string) => {
        const allImageData = imageData.filter((image) => image.url !== imageUrl);
        setImageData(allImageData);
    };

    const [expandedImage, setExpandedImage] = React.useState(null as ImageData|null);
    const onExpandedImageClose = () => setExpandedImage(null);

    return (<>
        <Box sx={{ width: 500, height: 450, overflowY: 'scroll' }}>
            <ImageList variant="masonry" cols={3} gap={8}>
                {imageData.map((image) => (
                    <ImageListItem key={image.url} onClick={() => setExpandedImage(image)}>
                        <MemoizedImage
                            src={`${image.url}?w=248&fit=crop&auto=format`}
                            // srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
                            alt={image.name}
                            loading="lazy"
                        />
                    </ImageListItem>
                ))}
            </ImageList>
        </Box>
        {EditableExpandedImageModal(expandedImage, onExpandedImageClose, removeImage)}
        {UploadButton(addMore)}
    </>);
}

type Controls = {
    insertNewParagraph: () => void;
    insertNewImageSet: () => void;
    deleteItem: (id: string) => void;
    moveUpwards: (id: string) => void;
    moveDownwards: (id: string) => void;
};

function insertAtIndex<T>(x: T, arr: T[], index: number) {
    return arr.slice(0, index).concat([x]).concat(arr.slice(index));
}

function makeControls(
    articleState: Record<string, ArticleItem>,
    articleOrder: string[],
    setCurrentOrder: (order: string[]) => void,
): Controls {
    return {
        insertNewParagraph: () => {
            // adds paragraph to end of article
            const id = uuid();
            const item: ParagraphItem = {id, paragraph: '', type: 'paragraph'};
            articleState[id] = item;
            articleOrder.push(id);
            setCurrentOrder(articleOrder);
        },

        insertNewImageSet: () => {
            // adds paragraph to end of article
            const id = uuid();
            const item: SlideshowItem = {id, images: [], type: 'slideshow'};
            articleState[id] = item;
            articleOrder.push(id);
        },

        deleteItem: (idToDelete: string) => {
            delete articleState[idToDelete];
            const newOrder = articleOrder.filter((x) => x !== idToDelete);
            setCurrentOrder(newOrder);
        },

        moveUpwards: (idOfCallingItem: string) => {
            const targetIdx = articleOrder.findIndex((x) => x === idOfCallingItem);
            if (targetIdx && targetIdx > 0) {
                const targetId = articleOrder[targetIdx];
                const temp = articleOrder[targetIdx - 1];
                articleOrder[targetIdx] = temp;
                articleOrder[targetIdx - 1] = targetId;
            }
        },

        moveDownwards: (idOfCallingItem: string) => {
            const targetIdx = articleOrder.findIndex((x) => x === idOfCallingItem);
            if (targetIdx && targetIdx < articleOrder.length - 1) {
                const targetId = articleOrder[targetIdx];
                const temp = articleOrder[targetIdx + 1];
                articleOrder[targetIdx] = temp;
                articleOrder[targetIdx + 1] = targetId;
            }
        },
    };
}

function ElementWithControls<T extends {id: string}>(
    item: T,
    elementFactory: (item: T) => JSX.Element,
    deleteItem: (id: string) => void,
    moveUpwards: (id: string) => void,
    moveDownwards: (id: string) => void
) {
    const [open, setOpen] = React.useState(false);

    // new paragraphs/images always go below
    const element = elementFactory(item);

    return (
        <Box>
            {element}
            <Button onClick={() => setOpen(true)}>Edit</Button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
            >
                <ButtonGroup>
                    <Button onClick={() => deleteItem(item.id)}>Delete</Button>
                    <Button onClick={() => moveUpwards(item.id)}>Move Upwards</Button>
                    <Button onClick={() => moveDownwards(item.id)}>Move Downwards</Button>
                </ButtonGroup>
            </Modal>
            
        </Box>
    );
};

export function ContentCreationGroup(
    articleState: Record<string, ArticleItem>,
    initialOrder: string[],
    upload: (ordering: string[]) => void,
) {
    const [currentOrder, setCurrentOrder] = React.useState(initialOrder.slice());

    const controls = makeControls(articleState, currentOrder, setCurrentOrder);
    const {insertNewParagraph, insertNewImageSet, deleteItem, moveUpwards, moveDownwards} = controls;

    const mapContentToComponent = (item: ArticleItem) => {
        const type = item.type;
        if (type === 'paragraph') {
            return ElementWithControls(
                item,
                NewParagraph,
                deleteItem,
                moveUpwards,
                moveDownwards,
            );
        } else if (type === 'slideshow') {
            return ElementWithControls(
                item,
                MasonryImageListUpload,
                deleteItem,
                moveUpwards,
                moveDownwards,
            );
        }
        // TODO: video
    }

    return (
        <div>
            {currentOrder.map((itemId) => articleState[itemId]).map((item) => {
                return <div key={item.id}>{mapContentToComponent(item)}</div>;
            })}
            <ButtonGroup>
                <Button onClick={() => insertNewParagraph()}>New Paragraph</Button>
                <Button onClick={() => insertNewImageSet()}>New Slideshow</Button>
                <Button onClick={() => upload(currentOrder)}>Upload</Button>
            </ButtonGroup>
        </div>
    );

}