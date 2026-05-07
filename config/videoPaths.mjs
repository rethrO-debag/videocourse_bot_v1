import path from 'path';

export const VIDEO_PATHS = {
    intro: path.resolve(process.cwd(), 'videos', 'Вступительное слово.mp4'),
    lessons: [
        path.resolve(process.cwd(), 'videos', 'Первый урок.mp4'),
        path.resolve(process.cwd(), 'videos', 'Второй урок.mp4'),
        path.resolve(process.cwd(), 'videos', 'Третий урок.mp4'),
        path.resolve(process.cwd(), 'videos', 'Четвертый урок.mp4'),
        path.resolve(process.cwd(), 'videos', 'Пятый урок.mp4'),
        path.resolve(process.cwd(), 'videos', 'заключительное слово.mp4')
    ]
};