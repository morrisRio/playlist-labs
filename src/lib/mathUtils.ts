//should first get the genre seeds and then compare the genre seeds with the search query, but only for the amount of entered characters
export function levenshteinDistance(
    candidate: string,
    searchFor: string
): number {
    if (!candidate.length) return searchFor.length;
    if (!searchFor.length) return candidate.length;

    return Math.min(
        levenshteinDistance(candidate.substring(1), searchFor) + 1,
        levenshteinDistance(searchFor.substring(1), candidate) + 1,
        levenshteinDistance(candidate.substring(1), searchFor.substring(1)) +
            (candidate.charAt(0).toLowerCase() !==
            searchFor.charAt(0).toLowerCase()
                ? 1
                : 0)
    );
}
