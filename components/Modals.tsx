import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { Button, ButtonGroup, TextField, Typography } from '@mui/material';
import { ArticleAdminSummary, ArticleStatusActions, ImageData } from '../lib/types';
import React from 'react';
import { takeArticleAction, editArticleRedirect } from '../lib/endpoints';
import Image from 'next/image';

type PendingActionType = {action: ArticleStatusActions|null, title: string};

export function DoubleCheck({
    action, title, sayYes, sayNo,
}: PendingActionType & {sayYes: () => void, sayNo: () => void}) {
    if (!action) return <></>;
    return (
        <Box>
            <Typography id="modal-modal-title" variant="h6" component="h2">
                {`${action.toUpperCase()} ${title}???`}
            </Typography>
            <ButtonGroup variant="outlined" aria-label="outlined button group">
                <Button onClick={sayYes}>Yes</Button>
                <Button onClick={sayNo}>No</Button>
            </ButtonGroup>
        </Box>
    );
}

export function ActionModal(
    article: ArticleAdminSummary,
    close: () => void,
) {
    const [pendingAction, setPendingAction] = React.useState(null as ArticleStatusActions|null);

    if (!article.title) return <></>;

    const {title, published} = article;
    const publishAction = published ? 'unpublish' : 'publish';
    return (
        <Modal
            open={!!title}
            onClose={close}
        >
            <Box>
                <Typography id="modal-modal-title" variant="h6" component="h2">Options</Typography>
                <ButtonGroup variant="outlined" aria-label="outlined button group">
                    <Button onClick={() => editArticleRedirect(title)}>Edit</Button>
                    <Button onClick={() => setPendingAction(publishAction)}>{publishAction}</Button>
                    <Button onClick={() => setPendingAction('delete')}>Delete</Button>
                </ButtonGroup>
                <DoubleCheck 
                    action={pendingAction}
                    title={title}
                    sayYes={() => takeArticleAction(title, pendingAction!)}
                    sayNo={() => setPendingAction(null)}
                />
            </Box>
        </Modal>
    );
}

export function NewArticleModal(
    submitNewArticle: (title: string) => void,
) {
    const [open, setOpen] = React.useState(false);
    const [title, setTitle] = React.useState(null as string|null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    return (<>
        <Button onClick={() => setOpen(true)}>New Article</Button>
        <Modal
            open={open}
            onClose={close}
        >
            <Box>
                <Typography id="modal-modal-title" variant="h6" component="h2">Title</Typography>
                <TextField
                    id="outlined-textarea"
                    label="New Title"
                    placeholder="New Title"
                    onChange={handleChange}
                />
                <ButtonGroup variant="outlined" aria-label="outlined button group">
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={() => {
                        if (title && title.length >= 1) {
                            submitNewArticle(title);
                        }
                    }}>
                        Create
                    </Button>
                </ButtonGroup>
            </Box>
        </Modal>
    </>);
}

export function ExpandedImageModal(image: ImageData|null, close: () => void) {
    const open = image !== null; // check if image is just {}
    if (!open) return <></>;
    return (
        <Modal
            open={open}
            onClose={close}
        >
            <Box>
                <Image
                    src={image.url}
                    alt={image.name}
                    loading="lazy"
                />
            </Box>
        </Modal>
    );
}

export function EditableExpandedImageModal(image: ImageData|null, closeFn: () => void, deleteFn: (url: string) => void) {
    const open = image !== null; // check if image is just {}
    if (!open) return <></>;

    const removeImage = () => deleteFn(image.url);
    return (
        <Modal
            open={open}
            onClose={closeFn}
        >
            <Box>
                <Image
                    src={image.url}
                    alt={image.name}
                    loading="lazy"
                />
                <Button onClick={removeImage}>Delete</Button>
            </Box>
        </Modal>
    );
}
