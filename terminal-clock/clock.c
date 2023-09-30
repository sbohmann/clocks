#include <curses.h>
#include <unistd.h>
#include <sys/time.h>
#include <inttypes.h>
#include <math.h>

// Definition of implicit fixed point type
// This implies that microseconds are seconds in this fixed pint format
const int64_t ONE = 1000 * 1000;

void drawHandDot(int x, int y);

void drawLine(int x1, int y1, int x2, int y2, void (*drawDot)(int x, int y));

int main()
{
    initscr();
    cbreak();
    noecho();

    while (1) {
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

        int64_t secondPosition = second_of_minute * COLS / ONE;
        int64_t minutePosition = minute_of_hour * COLS / ONE;
        int64_t hourPosition = hour_of_half_day * COLS / ONE;

//         char buffer[2000];
//         sprintf(buffer, "second_of_day: %" PRId64 ", hour_of_half_day: %" PRId64 "\nhour: %" PRId64 ", minute: %" PRId64 ", second: %" PRId64 "\ntz_minuteswest: %d, tz_dsttime: %d\n",
//             second_of_day, hour_of_half_day,
//             hour_of_half_day * 1200 / ONE,
//             minute_of_hour * 6000 / ONE,
//             second_of_minute * 6000 / ONE,
//             tz_minuteswest,
//             tz_dsttime);

        clear();
        mvaddch(0, secondPosition, 'S');
        mvaddch(1, minutePosition, 'M');
        mvaddch(2, hourPosition, 'H');
        drawLine(0, LINES - 1, secondPosition, 0, drawHandDot);
        drawLine(0, LINES - 1, minutePosition, 0, drawHandDot);
        drawLine(0, LINES - 1, hourPosition, 0, drawHandDot);
        mvaddch(LINES - 1, 0, '-');
//         mvaddstr(10, 0, buffer);
        refresh();
        usleep(100000);
    }

    endwin();
}

void drawHandDot(int x, int y) {
    mvaddch(y, x, '*');
}

void drawLine(int x1, int y1, int x2, int y2, void (*drawDot)(int x, int y)) {
    int dx = abs(x2 - x1);
    int dy = abs(y2 - y1);
    if (dx > dy) {
        int xDirection = sign(x2 - x1);
        for (int xOffset = 0; xOffset <= dx; ++xOffset) {
            int x = x1 + xOffset * xDirection;
            int64_t part = xOffset * ONE / dx;
            int y = (int)(part * dy / ONE);
            drawDot(x, y);
        }
    } else if (dy > dx) {
        int yDirection = sign(y2 - y1);
        for (int yOffset = 0; yOffset <= dy; ++yOffset) {
            int64_t part = yOffset * ONE / dy;
            int x = (int)(part * dx / ONE);
            int y = y1 + yOffset * yDirection;
            drawDot(x, y);
        }
    }
}
