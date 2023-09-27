#include <curses.h>
#include <unistd.h>
#include <sys/time.h>
#include <inttypes.h>


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

        int64_t whole_second_of_day = tv_sec % 86400;
        int64_t second_of_day = whole_second_of_day * 1000 * 1000 + tv_usec;
        int64_t second_of_minute = second_of_day % (60 * 1000 * 1000);

        int64_t secondPosition = second_of_minute * COLS / 1000 / 1000 / 60;

        char buffer[2000];
        sprintf(buffer, "second_of_day: %" PRId64 ", secondPosition: %" PRId64 "\n", second_of_day, secondPosition);

        clear();
        mvaddch(0, secondPosition, 'S');
        mvaddch(LINES - 1, 0, '-');
        mvaddstr(10, 30, buffer);
        refresh();
        usleep(100000);
    }

    endwin();
}
