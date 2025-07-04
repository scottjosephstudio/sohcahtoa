import React from "react";
import { LoadMoreContainer, LoadMoreButton } from "./StyledComponents";
import { eventSystem } from "./EventSystem";

const LoadMoreButtonComponent = ({
  isLoading,
  hasMore,
  showLoadMoreButton,
  visibleImages,
  shuffledImages,
  setVisibleImages,
  setHasMore,
  setIsLoading,
  columnsPerRow,
  getLoadMoreCount,
}) => {
  // Safari detection
  const isSafari = () => {
    if (typeof window === "undefined") return false;
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  };

  // Enhanced load more function with Safari-specific scroll positioning
  const loadMore = async () => {
    if (isLoading) return;

    setIsLoading(true);

    // Signal that we're starting a View More operation
    eventSystem.publish("viewMoreClicked", true);

    const currentLength = visibleImages.length;
    const loadMoreCount = getLoadMoreCount();

    const nextImages = shuffledImages.slice(
      currentLength,
      currentLength + loadMoreCount,
    );

    // Add new images to visible list immediately - no aspect ratio loading needed!
    setVisibleImages([...visibleImages, ...nextImages]);

    // Check if we've shown all images
    const isLastBatch =
      currentLength + nextImages.length >= shuffledImages.length;

    if (isLastBatch) {
      setHasMore(false);
    }

    setIsLoading(false);

    // Reset view more flag after operation completes
    setTimeout(() => {
      eventSystem.publish("viewMoreComplete", false);
    }, 500);
  };

  return (
    hasMore && (
      <LoadMoreContainer $visible={showLoadMoreButton}>
        <LoadMoreButton onClick={loadMore} disabled={isLoading}>
          {isLoading ? "Loading..." : "View More"}
        </LoadMoreButton>
      </LoadMoreContainer>
    )
  );
};

export default LoadMoreButtonComponent;
