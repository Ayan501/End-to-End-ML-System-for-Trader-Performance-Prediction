import sys


def error_message_detail(error: Exception, error_detail: sys) -> str:
    _, _, exc_tb = error_detail.exc_info()
    file_name = exc_tb.tb_frame.f_code.co_filename if exc_tb else "unknown_file"
    line_number = exc_tb.tb_lineno if exc_tb else "unknown_line"
    return (
        f"Error occurred in python script [{file_name}] "
        f"at line [{line_number}] with message [{str(error)}]"
    )


class CustomException(Exception):
    def __init__(self, error_message: Exception, error_detail: sys) -> None:
        super().__init__(error_message)
        self.error_message = error_message_detail(
            error=error_message, error_detail=error_detail
        )

    def __str__(self) -> str:
        return self.error_message
