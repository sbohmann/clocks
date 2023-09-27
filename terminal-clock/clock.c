#include <curses.h>
#include <unistd.h>
#include <sys/time.h>

int main()
{
    initscr();
    cbreak();
    noecho();

    for (int x = 0; x < COLS; ++x) {
        struct timeval timeval;
        struct timezone timezone;
        gettimeofday(&timeval, &timezone);

        time_t tv_sec = timeval.tv_sec;
        suseconds_t tv_usec = timeval.tv_usec;
        int tz_minuteswest = timezone.tz_minuteswest;
        int tz_dsttime = timezone.tz_dsttime;

        clear();
        mvaddch(0, x, '+');
        mvaddch(LINES - 1, 0, '-');
        mvaddstr(10, 30, "press any key to quit");
        refresh();
        usleep(100000);
    }

    getch();

    endwin();
}
