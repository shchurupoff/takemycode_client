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
  TableSortLabel,
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
    { skip: !!search && offset > 0 }
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
      const newSelected = localItems.map((item) => item);
      setSelected(newSelected);
      updateState({ selectedItems: newSelected });
      return;
    }
    setSelected([]);
    updateState({ selectedItems: [] });
  };

  const handleClick = (event, item) => {
    const selectedIndex = selected.indexOf(item);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, item];
    } else {
      newSelected = selected.filter((selectedItem) => selectedItem !== item);
    }

    setSelected(newSelected);
    updateState({ selectedItems: newSelected });
  };

  const isSelected = (item) => selected.indexOf(item) !== -1;

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(localItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalItems(items);
    updateState({ sortedItems: items });
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
                <TableCell>
                  <TableSortLabel>Выбрать все</TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>

            <Droppable droppableId="items">
              {(provided) => (
                <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                  {localItems.map((item, index) => (
                    <Draggable
                      key={Math.random()}
                      draggableId={item.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          hover
                          role="checkbox"
                          aria-checked={isSelected(item)}
                          selected={isSelected(item)}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected(item)}
                              onClick={(event) => handleClick(event, item)}
                            />
                          </TableCell>
                          <TableCell>{item}</TableCell>
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
