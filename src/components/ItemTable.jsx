import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  Box,
  CircularProgress,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  useGetItemsQuery,
  useGetStateQuery,
  useUpdateStateMutation,
} from "../api/apiSlice";

const ItemTable = () => {
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [localItems, setLocalItems] = useState([]);
  const [selected, setSelected] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { data: initialState } = useGetStateQuery();
  const [updateState] = useUpdateStateMutation();

  const { data: itemsData, isFetching } = useGetItemsQuery(
    { search, offset },
    {
      skip: (!!search && offset > 0) || (!isLoading && !search),
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
    }
  }, [itemsData]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore && !isFetching) {
      setIsLoading(true);
      setOffset((prev) => prev + 20);
    }
  }, [isLoading, hasMore, isFetching]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop ===
        document.documentElement.offsetHeight
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = localItems.map((item) => item.value);
      setSelected(newSelected);
      updateState({ selectedItems: newSelected });
      return;
    }
    setSelected([]);
    updateState({ selectedItems: [] });
  };

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
    console.log(result, localItems);

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
          return localItems[start].order;
        } else {
          return item.order;
        }
      }
      if (end - start < 0) {
        if (index > end && index <= start) {
          return item.order + 1;
        }
        if (index === end) {
          return localItems[start].order;
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

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setOffset(0);
    setLocalItems([]);
    setHasMore(true);
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TextField
        label="Поиск"
        variant="outlined"
        value={search}
        onChange={handleSearchChange}
        sx={{ m: 2, width: "95%" }}
      />

      <TableContainer>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selected.length > 0 && selected.length < localItems.length
                    }
                    checked={
                      localItems.length > 0 &&
                      selected.length === localItems.length
                    }
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Order</TableCell>
              </TableRow>
            </TableHead>

            <Droppable droppableId="items">
              {(provided) => (
                <TableBody ref={provided.innerRef} {...provided.droppableProps}>
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
                          role="checkbox"
                          aria-checked={isSelected(item.value)}
                          selected={isSelected(item.value)}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected(item.value)}
                              onClick={(event) =>
                                handleClick(event, item.value)
                              }
                            />
                          </TableCell>
                          <TableCell>{item.value}</TableCell>
                          <TableCell>{item.order}</TableCell>
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
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress />
        </Box>
      )}
    </Paper>
  );
};

export default ItemTable;
