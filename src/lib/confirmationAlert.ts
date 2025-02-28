import Swal from "sweetalert2";

export function codeCondfirmationAlert(props: {
  cb: (userCodeConfirmation: string) => void;
  isUpdate: boolean;
  isConfirm?: () => void;
  isDeclined?: () => void;
  text?: string;
  title?: string;
  saveTitle?: string;
}) {
  Swal.fire({
    title: props?.title ? props?.title :`Are you sure!`,
    html: props?.text
      ? props?.text
      : props.isUpdate
      ? `Are you sure you want to make this change?`
      : "Are you sure you want to delete this?",
    icon: "warning",
    input: "text",
    inputAttributes: {
      autocapitalize: "off",
    },
    showCancelButton: true,
    confirmButtonText: props?.saveTitle ? props?.saveTitle : "Save",
    confirmButtonColor: "green",
    showLoaderOnConfirm: true,
    preConfirm: async (userCodeConfirmation) => {
      try {
        props.cb(userCodeConfirmation);
      } catch (error) {
        Swal.showValidationMessage(`
            Request failed: ${error}
          `);
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  }).then((result) => {
    if (result.isConfirmed) {
      if (props.isConfirm) {
        return props.isConfirm();
      }
    }
    if (props.isDeclined) {
      props.isDeclined();
    }
  });
}

export function saveCondfirmationAlert(props: {
  isConfirm?: () => void;
  isDeclined?: () => void;
  text?: string;
}) {
  Swal.fire({
    title: "Are you sure?",
    text: props?.text ? props?.text : "Do you want to proceed with saving?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, save it!",
  }).then((result) => {
    if (result.isConfirmed) {
      if (props.isConfirm) {
        return props.isConfirm();
      }
    }
    if (props.isDeclined) {
      props.isDeclined();
    }
  });
}
