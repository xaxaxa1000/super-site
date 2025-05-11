export const getVideoId = (url) => {
    const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|&v=))([\w-]{11})/i
    const ytMatch = url.match(ytRegex)
    if (ytMatch) return { platform: 'youtube', id: ytMatch[1] }

    const rutubeRegex = /rutube\.ru\/video\/(?:[^\/]+\/)?([a-f0-9]{32})/i
    const rutubeMatch = url.match(rutubeRegex)
    if (rutubeMatch) return { platform: 'rutube', id: rutubeMatch[1] }

    return null
}