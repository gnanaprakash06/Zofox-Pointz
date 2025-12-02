// pages/Stories.tsx
import { createStoryColumns, StoryActionType } from "@/colDef/storyColDef";
import {
  Button,
  Card,
  CardContent,
  CustomAlertDialog,
  DataTable,
  ErrorMessage,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  PageContainer,
  Spinner,
} from "@/components";
import StoryDialog from "@/components/StoryDialog";
import {
  useDeleteStoryMutation,
  useInfiniteStoriesQuery,
} from "@/hooks/api/story.queries";
import useDebounce from "@/hooks/useDebounce";
import { useAlertDialog, useStoryDialog } from "@/hooks/useDialogState";
import { StoryParamsType, StoryType } from "@/services/story.service";
import { Filter, Plus, SearchIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const Stories = () => {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Confirmation dialog
  const deleteDialog = useAlertDialog();
  const storyDialog = useStoryDialog();

  // Build filters
  const filters: Omit<StoryParamsType, "page"> = useMemo(
    () => ({
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...(debouncedSearch && { search: debouncedSearch }),
    }),
    [debouncedSearch]
  );

  // Queries and mutations
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteStoriesQuery(filters);

  const deleteMutation = useDeleteStoryMutation(filters);

  // Flatten paginated data
  const stories = useMemo(() => {
    return data?.pages.flatMap((page) => page.stories) || [];
  }, [data]);

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLoading || isFetchingNextPage) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Handle delete
  const handleDelete = useCallback(() => {
    deleteMutation.mutate(deleteDialog.state.storyId, {
      onSuccess: () => {
        deleteDialog.close();
      },
    });
  }, [deleteMutation, deleteDialog]);

  // Handle action click from column
  const handleActionClick = useCallback(
    (payload: StoryActionType) => {
      if (payload.action === "delete") {
        deleteDialog.open({
          message: (
            <span>
              Are you sure you want to delete{" "}
              <strong className="text-gray-800 dark:text-gray-200">
                {payload.title}
              </strong>
              ? This action cannot be undone.
            </span>
          ),
          storyId: payload.id,
          storyTitle: payload.title,
        });
      } else if (payload.action === "edit") {
        // Open edit dialog
        storyDialog.open({
          mode: "edit",
          storyId: payload.id,
        });
      }
    },
    [deleteDialog, storyDialog]
  );

  // Open dialog for create
  const handleCreateClick = () => {
    storyDialog.open({
      mode: "create",
      storyId: "",
    });
  };

  const columns = useMemo(
    () => createStoryColumns(handleActionClick),
    [handleActionClick]
  );

  // Error state
  if (isError) {
    return (
      <ErrorMessage
        message="Failed to load stories page."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <PageContainer className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-4 text-2xl font-bold">Stories</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all devotional stories
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700"
        >
          <Plus size={20} />
          Add New Story
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <InputGroup className="flex-1">
          <InputGroupInput
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon size={20} />
          </InputGroupAddon>
        </InputGroup>
        <Button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
          <Filter size={20} />
          Filter
        </Button>
      </div>

      {/* Table */}
      <Card className="flex min-h-0 flex-1 flex-col">
        <CardContent className="scrollbar-thin min-h-0 flex-1 overflow-x-auto p-0">
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <DataTable<StoryType, any> columns={columns} data={stories} />

              {/* Loading indicator for infinite scroll */}
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600"></div>
                </div>
              )}

              {/* Intersection observer target */}
              <div ref={loadMoreRef} className="h-4" />

              {/* No more data message */}
              {!hasNextPage && stories.length > 0 && (
                <div className="py-4 text-center text-sm text-gray-500">
                  No more stories to load
                </div>
              )}

              {/* Empty state */}
              {stories.length === 0 && !isLoading && (
                <div className="py-12 text-center text-gray-500">
                  No stories found
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Story Dialog */}
      <StoryDialog
        mode={storyDialog.state.mode}
        isOpen={storyDialog.state.isOpen}
        onOpenChange={(open) => !open && storyDialog.close()}
        filters={filters}
        storyId={storyDialog.state.storyId}
        onCancel={storyDialog.close}
      />

      {/* Delete Confirmation Dialog */}
      <CustomAlertDialog
        isOpen={deleteDialog.state.isOpen}
        onOpenChange={(open) => !open && deleteDialog.close()}
        title="Confirm Deletion"
        description={deleteDialog.state.message}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={deleteDialog.close}
      />
    </PageContainer>
  );
};

export default Stories;
