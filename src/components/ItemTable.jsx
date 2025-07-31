import { useState, useEffect, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
    Checkbox,
    TextField,
    Box,
    CircularProgress,
    TableHead,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
    useGetItemsQuery,
    useGetStateQuery,
    useUpdateStateMutation,
} from '../api/apiSlice';

const ItemTable = () => {
    const [min, setMin] = useState(null);
    const [max, setMax] = useState(null);
    const [offset, setOffset] = useState(0);
    const [localItems, setLocalItems] = useState([]);
    const [selected, setSelected] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [isNeedMore, setIsNeedMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { data: initialState } = useGetStateQuery(
        { min, max, offset },
        {
            skip: localItems.length !== 0 || isNeedMore,
        }
    );
    const [updateState] = useUpdateStateMutation();

    const { data: itemsData, isFetching } = useGetItemsQuery(
        { min, max, offset },
        {
            skip: !isNeedMore,
        }
    );

    useEffect(() => {
        if (initialState) {
            setLocalItems(initialState.sortedItems);
            setSelected(initialState.selectedItems);
        }
    }, [initialState]);

    useEffect(() => {
        if (itemsData) {
            setLocalItems((prev) => [...prev, ...itemsData.items]);
            setHasMore(itemsData.hasMore);
            setIsLoading(false);
            setIsNeedMore(false);
        }
    }, [itemsData]);

    const loadMore = useCallback(() => {
        if (!isLoading && hasMore && !isFetching) {
            setIsLoading(true);
            setOffset((prev) => prev + 20);
            setIsNeedMore(true);
        }
    }, [isLoading, hasMore, isFetching]);

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 10
            ) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMore]);

    const handleClick = (event, itemValue) => {
        const selectedIndex = selected.indexOf(itemValue);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = [...selected, itemValue];
        } else {
            newSelected = selected.filter((value) => value !== itemValue);
        }

        setSelected(newSelected);
        updateState({ selectedItems: newSelected });
    };

    const isSelected = (itemValue) => selected.indexOf(itemValue) !== -1;

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(localItems);
        const [reorderedItem] = items.splice(result.source.index, 1);

        items.splice(result.destination.index, 0, reorderedItem);
        const start = result.source.index;
        const end = result.destination.index;

        const newOrder = (item, index, arr) => {
            if (end - start > 0) {
                if (index < end && index >= start) {
                    return item.order - 1;
                }
                if (index === end) {
                    return localItems[end].order;
                } else {
                    return item.order;
                }
            }
            if (end - start < 0) {
                if (index > end && index <= start) {
                    return item.order + 1;
                }
                if (index === end) {
                    return localItems[end].order;
                } else {
                    return item.order;
                }
            }
        };

        const updatedItems = items.map((item, index, arr) => ({
            ...item,
            order: newOrder(item, index, arr),
        }));
        setLocalItems(updatedItems);
        updateState({ sortedItems: updatedItems });
    };

    const handleMinChange = (e) => {
        setMin(e.target.value !== '' ? e.target.value : null);
        setOffset(0);
        setLocalItems([]);
        setHasMore(true);
        setIsNeedMore(true);
    };

    const handleMaxChange = (e) => {
        setMax(e.target.value !== '' ? e.target.value : null);
        setOffset(0);
        setLocalItems([]);
        setHasMore(true);
        setIsNeedMore(true);
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <div style={{ display: 'flex' }}>
                <TextField
                    label='Min'
                    type='number'
                    variant='outlined'
                    value={min}
                    onChange={handleMinChange}
                    sx={{ m: 2, width: '45%' }}
                />
                <TextField
                    label='Max'
                    type='number'
                    variant='outlined'
                    value={max}
                    onChange={handleMaxChange}
                    sx={{ m: 2, width: '45%' }}
                />
            </div>

            <TableContainer>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Table stickyHeader aria-label='sticky table'>
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>Значение</TableCell>
                                <TableCell>Порядок</TableCell>
                            </TableRow>
                        </TableHead>
                        <Droppable droppableId='items'>
                            {(provided) => (
                                <TableBody
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    {localItems.map((item, index) => (
                                        <Draggable
                                            key={item.value}
                                            draggableId={item.value.toString()}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <TableRow
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    hover
                                                    role='checkbox'
                                                    aria-checked={isSelected(
                                                        item.value
                                                    )}
                                                    selected={isSelected(
                                                        item.value
                                                    )}
                                                >
                                                    <TableCell padding='checkbox'>
                                                        <Checkbox
                                                            checked={isSelected(
                                                                item.value
                                                            )}
                                                            onClick={(event) =>
                                                                handleClick(
                                                                    event,
                                                                    item.value
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.value}
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.order}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </TableBody>
                            )}
                        </Droppable>
                    </Table>
                </DragDropContext>
            </TableContainer>

            {(isLoading || isFetching) && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                </Box>
            )}
        </Paper>
    );
};

export default ItemTable;
