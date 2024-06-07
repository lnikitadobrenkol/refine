import { type Option, useSelect } from "@refinedev/core";
import { List, useDataGrid } from "@refinedev/mui";
import React from "react";

import {
  DataGrid,
  type GridColDef,
  type GridValueFormatterParams,
} from "@mui/x-data-grid";

import type { ICategory, IPost } from "../../interfaces";

export const PostList: React.FC = () => {
  const { dataGridProps } = useDataGrid<IPost>({
    initialCurrent: 1,
    initialPageSize: 10,
    initialSorter: [
      {
        field: "title",
        order: "asc",
      },
    ],
    initialFilter: [
      {
        field: "status",
        operator: "eq",
        value: "draft",
      },
    ],
    syncWithLocation: true,
  });

  const {
    options,
    queryResult: { isLoading },
  } = useSelect<ICategory>({
    resource: "categories",
  });

  const handleProcessRowUpdate = React.useCallback(
    async (newRow: IPost, oldRow: IPost) => {
      try {
        const response = await fetch(
          `https://api.fake-rest.refine.dev/posts/${newRow.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newRow),
          },
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return newRow;
      } catch (error) {
        console.error("Error updating post:", error);
        return oldRow;
      }
    },
    [],
  );

  const columns = React.useMemo<GridColDef<IPost>[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        type: "number",
        width: 50,
      },
      {
        field: "title",
        headerName: "Title",
        minWidth: 400,
        flex: 1,
        editable: true,
      },
      {
        field: "category.id",
        headerName: "Category",
        type: "singleSelect",
        headerAlign: "left",
        align: "left",
        minWidth: 250,
        flex: 0.5,
        valueOptions: options,
        valueFormatter: (params: GridValueFormatterParams<Option>) => {
          return params.value;
        },
        renderCell: function render({ row }) {
          if (isLoading) {
            return "Loading...";
          }

          const category = options.find(
            (item) => item.value.toString() === row.category.id.toString(),
          );
          return category?.label;
        },
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 120,
        flex: 0.3,
        type: "singleSelect",
        valueOptions: ["draft", "published", "rejected"],
      },
    ],
    [options, isLoading],
  );

  return (
    <List>
      <DataGrid
        {...dataGridProps}
        columns={columns}
        autoHeight
        pageSizeOptions={[10, 20, 30, 50, 100]}
        processRowUpdate={handleProcessRowUpdate}
      />
    </List>
  );
};
