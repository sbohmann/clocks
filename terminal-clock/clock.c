#include <ncurses.h>
#include <unistd.h>
#include <sys/time.h>
#include <inttypes.h>
#include <stdlib.h>
#include <math.h>

// Definition of implicit fixed point type
// This implies that microseconds are seconds in this fixed pint format
const int64_t ONE = 1000 * 1000;

const bool COLOR_ENABLED = true;

enum ColorIndices {
    BLACK_ON_WHITE,
    BLUE_ON_WHITE,
    RED_ON_WHITE
};

void drawHandDot(int x, int y);

void drawLine(int x1, int y1, int x2, int y2, void (*drawDot)(int x, int y));

void drawLineAtAngle(int x, int y, int64_t angle, int radius, void (*drawDot)(int x, int y));

void drawDotAtAngle(int x, int y, int64_t angle, int radius, void (*drawDot)(int x, int y));

int main()
{
    initscr();

    if (COLOR_ENABLED && has_colors()) {
        start_color();
        init_pair(BLACK_ON_WHITE, COLOR_BLACK, COLOR_WHITE);
        init_pair(BLUE_ON_WHITE, COLOR_BLUE, COLOR_WHITE);
        init_pair(RED_ON_WHITE, COLOR_RED, COLOR_WHITE);
        bkgd(COLOR_PAIR(BLUE_ON_WHITE));
    }

    cbreak();
    noecho();

    while (1) {
        int size = (COLS / 2 < LINES ? COLS / 2 : LINES) * 9 / 20;

        struct timeval timeval;
        struct timezone timezone;
        gettimeofday(&timeval, &timezone);

        time_t tv_sec = timeval.tv_sec;
        suseconds_t tv_usec = timeval.tv_usec;
        int tz_minuteswest = timezone.tz_minuteswest;
        int tz_dsttime = timezone.tz_dsttime;

        int64_t whole_second_of_day = (tv_sec - tz_minuteswest * 60 + (tz_dsttime ? 3600 : 0)) % 86400;
        int64_t second_of_day = whole_second_of_day * ONE + tv_usec;

        int64_t second_of_minute = second_of_day % (60 * ONE) / 60;
        int64_t minute_of_hour = second_of_day % (60 * 60 * ONE) / 60 / 60;
        int64_t hour_of_half_day = second_of_day % (12 * 60 * 60 * ONE) / 12 / 60 / 60;

        erase();

        attron(COLOR_PAIR(BLUE_ON_WHITE));
        for (int n = 0; n < 12; ++n) {
            drawDotAtAngle(COLS / 2, LINES / 2, ONE * n / 12, size, drawHandDot);
        }
        drawLineAtAngle(COLS / 2, LINES / 2, hour_of_half_day, size * 2 / 3, drawHandDot);
        drawLineAtAngle(COLS / 2, LINES / 2, minute_of_hour, size * 9 / 10, drawHandDot);

        attron(COLOR_PAIR(RED_ON_WHITE));
        drawLineAtAngle(COLS / 2, LINES / 2, second_of_minute, size * 9 / 10, drawHandDot);

        mvaddch(LINES - 1, 0, '-');
        refresh();
        usleep(100000);
    }

    endwin();
}

void drawHandDot(int x, int y) {
    mvaddch(y, x, '*');
}

int sign(int value) {
    return value < 0
        ? -1
        : value > 0
            ? 1
            : 0;
}

void drawLine(int x1, int y1, int x2, int y2, void (*drawDot)(int x, int y)) {
    const int dx = abs(x2 - x1);
    const int dy = abs(y2 - y1);
    int xDirection = sign(x2 - x1);
    int yDirection = sign(y2 - y1);
    if (dx > dy) {
        for (int xOffset = 0; xOffset <= dx; ++xOffset) {
            int x = x1 + xOffset * xDirection;
            int64_t part = xOffset * ONE / dx;
            int y = (int)(y1 + (yDirection * part * dy + ONE / 2) / ONE);
            drawDot(x, y);
        }
    } else {
        for (int yOffset = 0; yOffset <= dy; ++yOffset) {
            int64_t part = yOffset * ONE / dy;
            int x = (int)(x1 + (xDirection * part * dx + ONE / 2) / ONE);
            int y = y1 + yOffset * yDirection;
            drawDot(x, y);
        }
    }
}

void drawLineAtAngle(int x, int y, int64_t angle, int radius, void (*drawDot)(int x, int y)) {
    int xEnd = x + (int)(2 * radius * sin(2 * M_PI * angle / ONE) + 0.5);
    int yEnd = y + (int)(radius * -cos(2 * M_PI * angle / ONE) + 0.5);
    drawLine(x, y, xEnd, yEnd, drawDot);
}

void drawDotAtAngle(int x, int y, int64_t angle, int radius, void (*drawDot)(int x, int y)) {
    int xEnd = x + (int)(2 * radius * sin(2 * M_PI * angle / ONE) + 0.5);
    int yEnd = y + (int)(radius * -cos(2 * M_PI * angle / ONE) + 0.5);
    drawDot(xEnd, yEnd);
}
