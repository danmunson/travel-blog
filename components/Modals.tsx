/* eslint-disable @next/next/no-img-element */
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { Button, ButtonGroup, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { ArticleAdminSummary, ArticleItem, ArticleStatusActions, ImageData } from '../lib/types';
import React from 'react';
import { takeArticleAction, editArticleRedirect, adminRedirect } from '../lib/endpoints';
import { BasicImage, EmptyDiv, BasicStyledModal, BasicStyledBox, CenteredContentsStyle } from './basics';

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
        <BasicStyledModal
            open={!!title}
            onClose={close}
        >
            <BasicStyledBox sx={{backgroundColor: 'white'}}>
                <Stack spacing={4} sx={{justifyItems: 'center'}}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">{`Actions for "${title}"`}</Typography>
                    <ButtonGroup variant="outlined" aria-label="outlined button group">
                        <Button onClick={() => editArticleRedirect(title)}>Edit</Button>
                        <Button onClick={() => setPendingAction(publishAction)}>{publishAction}</Button>
                        <Button onClick={() => setPendingAction('delete')}>Delete</Button>
                    </ButtonGroup>
                    <DoubleCheck 
                        action={pendingAction}
                        title={title}
                        sayYes={async () => {
                            await takeArticleAction(title, pendingAction!);
                            setPendingAction(null);
                            close();
                            adminRedirect();
                        }}
                        sayNo={() => setPendingAction(null)}
                    />
                </Stack>
            </BasicStyledBox>
        </BasicStyledModal>
    );
}

export function NewArticleModal(
    submitNewArticle: (title: string) => void,
) {
    const [open, setOpen] = React.useState(false);
    const title = React.useRef('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        title.current = event.target.value;
    };

    return (<>
        <Button onClick={() => setOpen(true)}>New Article</Button>
        <BasicStyledModal
            open={open}
            onClose={() => setOpen(false)}
        >
            <BasicStyledBox sx={{backgroundColor: 'white'}}>
                <Stack spacing={4} sx={{justifyItems: 'center'}}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">Title</Typography>
                    <TextField
                        id="outlined-textarea"
                        label="New Title"
                        placeholder="New Title"
                        onChange={handleChange}
                    />
                    <ButtonGroup variant="outlined" aria-label="outlined button group">
                        <Button onClick={() => {
                            if (title.current && title.current.length >= 1) {
                                submitNewArticle(title.current);
                            }
                        }}>
                            Create
                        </Button>
                    </ButtonGroup>
                </Stack>
            </BasicStyledBox>
        </BasicStyledModal>
    </>);
}

const imageStyles = {
    marginLeft: 'auto',
    marginRight: 'auto',
    display:'block',
};

const MemoizedBasicImage = React.memo(BasicImage);

export function ExpandedImageModal(image: ImageData|null, close: () => void) {
    const open = image !== null; // check if image is just {}
    const [isLoaded, setIsLoaded] = React.useState(false);
    const onLoad = React.useCallback(() => setIsLoaded(true), []);
    if (!open) return <></>;
    return (
        <BasicStyledModal
            open={open}
            onClose={() => {setIsLoaded(false); close()}}
        >
            <BasicStyledBox>
                <EmptyDiv sx={{...CenteredContentsStyle, backdropFilter: 'blur(6px)'}}>
                    <Box sx={{...CenteredContentsStyle, display: !isLoaded ? 'flex' : 'none' }}>
                        <CircularProgress />
                    </Box>
                    <MemoizedBasicImage style={imageStyles} image={image} onLoad={onLoad}/>
                </EmptyDiv>
            </BasicStyledBox>
        </BasicStyledModal>
    );
}

export function EditableExpandedImageModal(
    image: ImageData|undefined,
    closeFn: () => void,
    deleteFn: (url: string) => void
) {
    const open = !!image;
    if (!open) return <></>;

    const removeImage = () => deleteFn(image.url);
    return (
        <BasicStyledModal
            open={open}
            onClose={closeFn}
        >
            <BasicStyledBox sx={{height: '60%', width: '60%'}}>
                <EmptyDiv sx={CenteredContentsStyle}>
                    <Stack spacing={4}>
                        <BasicImage style={imageStyles} image={image}/>
                        <Button onClick={() => {removeImage(); closeFn()}} style={{backgroundColor: 'red'}}>Delete</Button>
                    </Stack>
                </EmptyDiv>
            </BasicStyledBox>
        </BasicStyledModal>
    );
}

export function ControlPanel(
    item: ArticleItem|null,
    onClose: () => void,
    deleteItem: (id: string) => void,
    moveUpwards: (id: string) => void,
    moveDownwards: (id: string) => void,
) {
    const open = !!item;
    if (!open) return <></>;
    return (
        <BasicStyledModal
            open={open}
            onClose={onClose}
        >
            <BasicStyledBox sx={{backgroundColor: 'white', width: '50%', height: '50%'}}>
                <ButtonGroup>
                    <Button onClick={() => {deleteItem(item.id); onClose()}}>Delete</Button>
                    <Button onClick={() => {moveUpwards(item.id); onClose()}}>Move Upwards</Button>
                    <Button onClick={() => {moveDownwards(item.id); onClose()}}>Move Downwards</Button>
                </ButtonGroup>
            </BasicStyledBox>
        </BasicStyledModal>
    );
}

export function UploadProgressDisplay(uploadProgress: number) {
    return (
        <BasicStyledModal open={uploadProgress > 0}>
            <BasicStyledBox sx={{backgroundColor: 'white', width: '50%', height: '50%'}}>
                <h1>{`Progress: ${uploadProgress}`}</h1>
            </BasicStyledBox>
        </BasicStyledModal>
    );
}
