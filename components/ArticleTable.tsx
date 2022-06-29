import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { datestringFromTimestamp } from '../lib/dates';
import { ArticleAdminSummary, ArticleStatusActions } from '../lib/types';
import { ActionModal } from './Modals';

export function ArticleTable(
    articles: ArticleAdminSummary[],
) {

    const articleDetails = articles.map((data) => {
        const createdAt = datestringFromTimestamp(data.createdTime);
        const status = data.published ? 'Published' : 'Not Published';
        return { title: data.title, createdAt, status, data };
    });

    const [selectedArticle, selectArticle] = React.useState({} as ArticleAdminSummary);

    return (<>
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Article Title</TableCell>
                        <TableCell align="right">Status</TableCell>
                        <TableCell align="right">Created</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {articleDetails.map(({ title, createdAt, status, data }) => (
                        <TableRow
                            key={title}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                            onClick={() => {
                                selectArticle(data);
                            }}
                        >
                            <TableCell component="th" scope="row">{title}</TableCell>
                            <TableCell align="right">{status}</TableCell>
                            <TableCell align="right">{createdAt}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        {ActionModal(selectedArticle, () => selectArticle({} as ArticleAdminSummary))}
    </>);
}
