/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useRef, useState } from "react";
import "froala-editor/js/froala_editor.pkgd.min.js";
import "froala-editor/js/plugins.pkgd.min.js";
import "froala-editor/css/froala_editor.min.css";
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/plugins/quick_insert.min.css";
import "froala-editor/css/plugins/char_counter.min.css";
import "froala-editor/css/plugins/code_view.min.css";
import "froala-editor/css/plugins/colors.min.css";
import "froala-editor/css/plugins/draggable.min.css";
import "froala-editor/css/plugins/emoticons.min.css";
import "froala-editor/css/plugins/file.min.css";
import "froala-editor/css/plugins/fullscreen.min.css";
import "froala-editor/css/plugins/help.min.css";
import "froala-editor/js/plugins/image.min.js";
import "froala-editor/css/plugins/image_manager.min.css";
import "froala-editor/css/plugins/image.min.css";
import "froala-editor/css/plugins/line_breaker.min.css";
import "froala-editor/css/plugins/quick_insert.min.css";
import "froala-editor/css/plugins/special_characters.min.css";
import "froala-editor/css/plugins/table.min.css";
import "froala-editor/css/plugins/video.min.css";
import "froala-editor/css/themes/gray.min.css";
import html2PDF from "jspdf-html2canvas";
import FroalaEditor from "react-froala-wysiwyg";
import Froalaeditor from "froala-editor";
import store from "store";
import "./edit.css";
import AccountBalanceWalletOutlinedIcon from "@material-ui/icons/AccountBalanceWalletOutlined";
import AccountCircleOutlinedIcon from "@material-ui/icons/AccountCircleOutlined";
import AssignmentIcon from "@material-ui/icons/Assignment";
import TextFieldsIcon from "@material-ui/icons/TextFields";
import CheckBoxOutlinedIcon from "@material-ui/icons/CheckBoxOutlined";
import DateRangeIcon from "@material-ui/icons/DateRange";
import { CloseOutlined } from "@material-ui/icons";
import "jquery-ui";
import "jquery-ui-dist/jquery-ui";
import {
  Backdrop,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@material-ui/core";
import { Circle } from "better-react-spinkit";
import moment from "moment";
import { Link, useHistory } from "react-router-dom";
import { gapi } from "gapi-script";
import ContentEditable from "react-contenteditable";
import axios from "axios";
import { url } from "../url/Url";
import {
  Button,
  Form,
  message,
  Modal,
  notification,
  Popconfirm,
  Rate,
  Checkbox,
  Col,
  Empty,
  Row,
} from "antd";
import { makeStyles } from "@material-ui/core/styles";
import queryString from "query-string";
import TextArea from "antd/lib/input/TextArea";
import { TeamOutlined } from "@ant-design/icons";

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 99999,
    color: "#fff",
  },
}));

const Editor = () => {
  const storedUser = store.get("digi_user")["plansubscription"];
  const remainingDays = moment(storedUser["expiry_date"]).diff(
    moment(),
    "days"
  );

  useEffect(() => {
    if (remainingDays < 0) {
      notification["info"]({
        message: "Plan Expired",
        description:
          "Your Plan has been Expired, kindly Subscribe Now to Continue.",
        onClick: function () {
          window.location.href = "/pricing";
        },
        style: { cursor: "pointer" },
      });
      history.goBack();
    }
  }, []);
  const classes = useStyles();
  const urlData = queryString.parse(window.location.search);
  const [bdOpen, setBdOpen] = useState(!true);
  let data = store.get("digi_user");
  const history = useHistory();
  const signOut = () => {
    if (data["provider"] === "google") {
      var auth2 = gapi.auth2.getAuthInstance();
      if (auth2 != null) {
        auth2.signOut().then(auth2.disconnect());
      }
      store.clearAll();
      history.push("/login");
    }
    if (data["provider"] === "facebook") {
      store.clearAll();
      history.push("/login");
      message.success("You Logged Out!!");
    } else {
      store.clearAll();
      history.push("/login");
      message.success("You Logged Out!!");
    }
  };
  useEffect(() => {
    setBdOpen(true);
    setTimeout(() => {
      setBdOpen(false);
    }, 1500);
  }, []);

  useEffect(() => {
    (function getDate() {
      var dragCallback = function (e) {
        e.dataTransfer.setData("Text", this.id);
      };
      document
        .querySelector("#input")
        .addEventListener("dragstart", dragCallback);
      document
        .querySelector("#dropdown")
        .addEventListener("dragstart", dragCallback);
      document
        .querySelector("#check")
        .addEventListener("dragstart", dragCallback);
      document
        .querySelector("#sign")
        .addEventListener("dragstart", dragCallback);
      document
        .querySelector("#party")
        .addEventListener("dragstart", dragCallback);
      document
        .querySelector("#textarea")
        .addEventListener("dragstart", dragCallback);
      document
        .querySelector("#date")
        .addEventListener("dragstart", dragCallback);
      document
        .querySelector("#header")
        .addEventListener("dragstart", dragCallback);
    })();
  }, []);

  const [open, setOpen] = useState(false);
  const [id1, setId1] = useState("");
  const [inputOpen, setInputOpen] = useState(false);
  const [checkOpen, setCheckOpen] = useState(false);
  const [partyOpen, setPartyOpen] = useState(false);
  const [textareaOpen, setTextareaOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [headerOpen, setHeaderOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);

  const [startDate, setStartDate] = useState(
    store.get("fileInfo")["start_date"] === null
      ? ""
      : store.get("fileInfo")["start_date"]
  );
  const [endDate, setEndDate] = useState(
    store.get("fileInfo")["end_date"] === null
      ? ""
      : store.get("fileInfo")["end_date"]
  );
  const [disabled, setDisabled] = useState(true);
  const [docType, setDocType] = useState(store.get("fileInfo")["doctype"]);
  const fileName = useRef("New Document");
  const [file, setFile] = useState("");
  const [docStartDate, setDocStartDate] = useState(
    store.get("fileInfo")["start_date"] === null
      ? ""
      : store.get("fileInfo")["start_date"]
  );
  const [docEndDate, setDocEndDate] = useState(
    store.get("fileInfo")["end_date"] === null
      ? ""
      : store.get("fileInfo")["end_date"]
  );

  useEffect(() => {
    if (store.get("fileInfo")) {
      fileName.current = store.get("fileInfo")["template_name"];
      setFile(fileName.current);
    }
  }, []);

  const [isDocument, setIsDocument] = useState("document");

  const handleClick = (e) => {
    setIsDocument(e.target.value);
    setEndDate(endDate);
    setStartDate(startDate);
  };

  const handleDownload = () => {
    setBdOpen(true);
    document.getElementById("pdf").style.display = "block";
    document.getElementById("pdf").innerHTML = store.get("htmlContent");
    const input = document.getElementById("pdf");
    html2PDF(input, {
      //margin: 1,
      // html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4" },
      imageType: "image/png",
      imageQuality: 1,
      margin: {
        top: 0.4,
        right: 0.7,
        left: 0.7,
        bottom: 0.4,
      },
      output: `${fileName.current}.pdf`,
    });
    document.getElementById("pdf").style.display = "none";
    setBdOpen(false);
    message.info("Wait a moment, PDF is being created for your download");
  };

  const handleStartDate = (e) => {
    setStartDate(e.target.value);
    setDisabled(false);
  };
  const handleDocSubmit = () => {
    let res = moment().format(docStartDate) <= moment().format(docEndDate);
    if (!res) {
      message.error("Please Check Date");
    } else {
      setBdOpen(true);
      var bodyFormData = new FormData();
      bodyFormData.append("token", store.get("digi_token"));
      bodyFormData.append("id", store.get("fileInfo")["id"]);
      bodyFormData.append("template_name", fileName.current);
      bodyFormData.append("type", "document");
      bodyFormData.append("doctype", docType);
      bodyFormData.append("text", store.get("htmlContent"));
      bodyFormData.append("start_date", docStartDate);
      bodyFormData.append("end_date", docEndDate);
      axios
        .post(
          `${url}/admin_git/digitalsignature/public/api/templates/update`,
          bodyFormData
        )
        .then((res) => {
          if (res.data.success) {
            setBdOpen(!true);
            message.success(res.data.message);
          } else {
            setBdOpen(!true);
            message.error(res.data.message);
          }
        })
        .catch((err) => {
          if (err.response.status === 401) {
            setBdOpen(false);
            message.error("Session Timed Out..Kindly Login Again!!");
            store.clearAll();
            history.push("/login");
          } else {
            setBdOpen(false);
            message.error("Something Went Wrong");
            console.log(err);
          }
        });
    }
  };

  const handleFileName = (e) => {
    fileName.current = e.target.value;
    setFile(fileName.current);
    handleAutoSave();
  };

  const handleSubmit = () => {
    let res = moment().format(startDate) <= moment().format(endDate);
    if (!res) {
      message.error("Please Check Date");
    } else {
      if (isDocument === "document") {
        submitDocument();
      } else {
        submitTemplate();
      }
    }
  };

  const submitDocument = () => {
    if (store.get("fileInfo")["type"] !== "document") {
      setBdOpen(true);
      var bodyFormData = new FormData();
      bodyFormData.append("token", store.get("digi_token"));
      bodyFormData.append("tname", fileName.current);
      bodyFormData.append("type", isDocument);
      bodyFormData.append("id", store.get("fileInfo")["id"]);
      bodyFormData.append("text", store.get("htmlContent"));
      bodyFormData.append("start_date", startDate);
      bodyFormData.append("end_date", endDate);
      bodyFormData.append("doctype", docType);
      axios
        .post(
          `${url}/admin_git/digitalsignature/public/api/templates/create`,
          bodyFormData
        )
        .then((res) => {
          if (res.data.success) {
            setBdOpen(false);
            message.success(res.data.message);
          } else {
            setBdOpen(false);
            message.error(res.data.message);
          }
        })
        .catch((err) => {
          if (err.response.status === 401) {
            setBdOpen(false);
            message.error("Session Timed Out..Kindly Login Again!!");
            store.clearAll();
            history.push("/login");
          } else {
            setBdOpen(false);
            message.error("Something Went Wrong");
            console.log(err);
          }
        });
    } else {
      setBdOpen(!false);
      var bodyFormData = new FormData();
      bodyFormData.append("token", store.get("digi_token"));
      bodyFormData.append("id", store.get("fileInfo")["id"]);
      bodyFormData.append("template_name", fileName.current);
      bodyFormData.append("type", isDocument);
      bodyFormData.append("start_date", startDate);
      bodyFormData.append("end_date", endDate);
      bodyFormData.append("doctype", docType);
      bodyFormData.append("text", store.get("htmlContent"));
      axios
        .post(
          `${url}/admin_git/digitalsignature/public/api/templates/update`,
          bodyFormData
        )
        .then((res) => {
          if (res.data.success) {
            setBdOpen(false);
            message.success(res.data.message);
          } else {
            setBdOpen(false);
            message.error(res.data.message);
          }
        })
        .catch((err) => {
          if (err.response.status === 401) {
            setBdOpen(false);
            message.error("Session Timed Out..Kindly Login Again!!");
            store.clearAll();
            history.push("/login");
          } else {
            setBdOpen(false);
            message.error("Something Went Wrong");
            console.log(err);
          }
        });
    }
  };

  const submitTemplate = () => {
    if (store.get("fileInfo")["type"] !== "template") {
      setBdOpen(!false);
      var bodyFormData = new FormData();
      bodyFormData.append("token", store.get("digi_token"));
      bodyFormData.append("id", store.get("fileInfo")["id"]);
      bodyFormData.append("tname", fileName.current);
      bodyFormData.append("type", isDocument);
      bodyFormData.append("text", store.get("htmlContent"));
      axios
        .post(
          `${url}/admin_git/digitalsignature/public/api/templates/create`,
          bodyFormData
        )
        .then((res) => {
          if (res.data.success) {
            setBdOpen(false);
            message.success(res.data.message);
          } else {
            setBdOpen(false);
            message.error(res.data.message);
          }
        })
        .catch((err) => {
          if (err.response.status === 401) {
            setBdOpen(false);
            message.error("Session Timed Out..Kindly Login Again!!");
            store.clearAll();
            history.push("/login");
          } else {
            setBdOpen(false);
            message.error("Something Went Wrong");
            console.log(err);
          }
        });
    } else {
      setBdOpen(!false);
      var bodyFormData = new FormData();
      bodyFormData.append("token", store.get("digi_token"));
      bodyFormData.append("tname", fileName.current);
      bodyFormData.append("id", store.get("fileInfo")["id"]);
      bodyFormData.append("type", isDocument);
      bodyFormData.append("text", store.get("htmlContent"));
      axios
        .post(
          `${url}/admin_git/digitalsignature/public/api/templates/update`,
          bodyFormData
        )
        .then((res) => {
          if (res.data.success) {
            setBdOpen(false);
            message.success(res.data.message);
          } else {
            setBdOpen(false);
            message.error(res.data.message);
          }
        })
        .catch((err) => {
          if (err.response.status === 401) {
            setBdOpen(false);
            message.error("Session Timed Out..Kindly Login Again!!");
            store.clearAll();
            history.push("/login");
          } else {
            setBdOpen(false);
            message.error("Something Went Wrong");
            console.log(err);
          }
        });
    }
  };

  const handleAutoSave = () => {
    setTimeout(() => {
      if (store.get("fileInfo")["type"] === "template") {
        var bodyFormData = new FormData();
        bodyFormData.append("token", store.get("digi_token"));
        bodyFormData.append("id", store.get("fileInfo")["id"]);
        bodyFormData.append("template_name", fileName.current);
        bodyFormData.append("type", store.get("fileInfo")["type"]);
        bodyFormData.append("text", store.get("htmlContent"));
        axios
          .post(
            `${url}/admin_git/digitalsignature/public/api/templates/update`,
            bodyFormData
          )
          .then((res) => {
            if (res.data.success) {
              store.set("fileInfo", res.data.data);
            } else {
              message.error(res.data.message);
            }
          })
          .catch((err) => {
            if (err.response.status === 401) {
              message.error("Session Timed Out..Kindly Login Again!!");
              store.clearAll();
              history.push("/login");
            } else {
              message.error("Something Went Wrong");
              console.log(err);
            }
          });
      } else {
        var bodyFormData = new FormData();
        bodyFormData.append("token", store.get("digi_token"));
        bodyFormData.append("id", store.get("fileInfo")["id"]);
        bodyFormData.append("template_name", fileName.current);
        bodyFormData.append("type", "document");
        bodyFormData.append("text", store.get("htmlContent"));
        bodyFormData.append("start_date", docStartDate);
        bodyFormData.append("end_date", docEndDate);
        bodyFormData.append("doctype", docType);
        axios
          .post(
            `${url}/admin_git/digitalsignature/public/api/templates/update`,
            bodyFormData
          )
          .then((res) => {
            if (res.data.success) {
              store.set("fileInfo", res.data.data);
            } else {
              message.error(res.data.message);
            }
          })
          .catch((err) => {
            if (err.response.status === 401) {
              message.error("Session Timed Out..Kindly Login Again!!");
              store.clearAll();
              history.push("/login");
            } else {
              message.error("Something Went Wrong");
              console.log(err);
            }
          });
      }
    }, 1500);
  };

  const handleOption = () => {
    let x = document.getElementById(id1);
    var option = document.createElement("option");
    option.text = document.getElementById("input1").value;
    x.add(option);

    var li = document.createElement("li");
    var t = document.createTextNode(option.text);
    li.appendChild(t);

    li.style.padding = "10px";
    li.style.borderBottom = "1px solid #eee";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    document.getElementById("opt").appendChild(li);
    document.getElementById("input1").value = "";

    var span = document.createElement("SPAN");
    var txt = document.createElement("button");
    txt.innerHTML = "&#9587";
    span.className = "remove";
    span.appendChild(txt);
    li.appendChild(span);
    txt.style.background = "white";
    txt.style.border = "none";
    txt.style.color = "#e34e48";
    txt.style.fontSize = "15px";
    txt.style.fontWeight = "700";

    var close = document.getElementsByClassName("remove");
    for (var j = 0; j < close.length; j++) {
      close[j].onclick = function () {
        var div = this.parentElement;
        handleRemove(div.firstChild.nodeValue, id1);
        div.style.display = "none";
      };
    }
  };

  const goCheck = (id) => {
    let x = document.getElementById(id);

    if (!document.getElementById("opt").firstChild) {
      for (var i = 0; i < x.length; i++) {
        var t = document.createTextNode(x.options[i].value);
        var li = document.createElement("li");
        li.appendChild(t);
        li.style.padding = "10px";
        li.style.borderBottom = "1px solid #eee";
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";

        document.getElementById("opt").appendChild(li);
        var span = document.createElement("SPAN");
        var txt = document.createElement("button");
        txt.innerHTML = "&#9587";
        span.className = "remove";
        span.appendChild(txt);
        li.appendChild(span);
        txt.style.background = "white";
        txt.style.border = "none";
        txt.style.color = "#e34e48";
        txt.style.fontSize = "15px";
        txt.style.fontWeight = "700";

        var close = document.getElementsByClassName("remove");
        for (var j = 0; j < close.length; j++) {
          close[j].onclick = function () {
            var div = this.parentElement;
            handleRemove(div.firstChild.nodeValue, id);
            div.style.display = "none";
          };
        }
      }
    }
  };

  const handleSelected = (e) => {
    var selected = e.currentTarget.options.selectedIndex;
    for (var i = 0; i < e.currentTarget.options.length; i++) {
      if (selected === i) {
        e.currentTarget.options[i].setAttribute("selected", true);
      } else {
        e.currentTarget.options[i].removeAttribute("selected");
      }
    }
  };

  const handleRemove = (option, id) => {
    let x = document.getElementById(id);
    for (var i = 0; i < x.length; i++) {
      if (x.options[i].value === option) x.remove(i);
    }
  };

  const handleRequired = (e) => {
    if (e.target.checked) {
      document.getElementById(id1).required = true;
    } else {
      document.getElementById(id1).required = false;
    }
  };

  const checkRequired = (e) => {
    if (e.currentTarget.attributes.required !== undefined) {
      document.getElementById("dropdownRequired").setAttribute("checked", true);
    } else {
      document.getElementById("dropdownRequired").removeAttribute("checked");
    }
  };

  let inputID;

  function myFunction() {
    let el = document.getElementById(inputID);
    let val = el.value;
    el.setAttribute("value", val);
    document.getElementById(inputID).setAttribute("value", el.value);
  }

  function dragElement(elmnt, id) {
    //let elmnt = document.getElementById(id);
    var pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    if (document.getElementById(id)) {
      /* if present, the header is where you move the DIV from:*/
      document.getElementById(id).onmousedown = dragMouseDown;
    } else {
      /* otherwise, move the DIV from anywhere inside the DIV:*/
      elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = elmnt.offsetTop - pos2 + "px";
      elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
    }

    function closeDragElement() {
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  const editorConfig = {
    documentReady: true,
    toolbarSticky: false,
    formEditButtons: [],
    formStyles: {},
    attribution: false,
    imageUpload: true,
    imageUploadURL: `${url}/admin_git/digitalsignature/public/api/templates/images`,
    imageUploadParam: "img",
    imageUploadParams: {
      token: store.get("digi_token"),
    },
    imageMove: true,

    events: {
      click: function (e) {
        var editor = this;
        if (e.currentTarget.id[0] === "d") {
          setInputOpen(false);
          setOpen(false);
          setOpen(true);
          setCheckOpen(false);
          setTextareaOpen(false);
          setPartyOpen(false);
          setDateOpen(false);
          setHeaderOpen(false);
          setSignOpen(false);
          setId1(e.currentTarget.id);
          goCheck(e.currentTarget.id);
          checkRequired(e);
          handleSelected(e);
          //handleAutoSave();
        } else {
          setOpen(false);
          store.set("htmlContent", editor.html.get());
          //handleAutoSave();
        }
        if (e.currentTarget.id[0] === "i") {
          setOpen(false);
          setInputOpen(false);
          setInputOpen(true);
          setCheckOpen(false);
          setTextareaOpen(false);
          setPartyOpen(false);
          setHeaderOpen(false);
          setDateOpen(false);
          setSignOpen(false);
          setId1(e.currentTarget.id);
          checkRequired(e);
        } else {
          setInputOpen(false);
          store.set("htmlContent", editor.html.get());
          //handleAutoSave();
        }
        if (e.currentTarget.id[0] === "c") {
          setInputOpen(false);
          setOpen(false);
          setCheckOpen(false);
          setCheckOpen(true);
          setTextareaOpen(false);
          setPartyOpen(false);
          setDateOpen(false);
          setSignOpen(false);
          setHeaderOpen(false);
          setId1(e.currentTarget.id);
          checkRequired(e);
        } else {
          setCheckOpen(false);
          store.set("htmlContent", editor.html.get());
          //handleAutoSave();
        }
        if (e.currentTarget.id[0] === "p") {
          setInputOpen(false);
          setOpen(false);
          setCheckOpen(false);
          setTextareaOpen(false);
          setPartyOpen(false);
          setPartyOpen(true);
          setSignOpen(false);
          setHeaderOpen(false);
          setDateOpen(false);
          setId1(e.currentTarget.id);
          checkRequired(e);
        } else {
          setPartyOpen(false);
          store.set("htmlContent", editor.html.get());
          //handleAutoSave();
        }
        if (e.currentTarget.id[0] === "t") {
          setInputOpen(false);
          setOpen(false);
          setCheckOpen(false);
          setTextareaOpen(false);
          setTextareaOpen(true);
          setPartyOpen(false);
          setSignOpen(false);
          setHeaderOpen(false);
          setDateOpen(false);
          setId1(e.currentTarget.id);
          checkRequired(e);
        } else {
          setTextareaOpen(false);
          store.set("htmlContent", editor.html.get());
          //handleAutoSave();
        }

        if (e.currentTarget.id[0] === "z") {
          setInputOpen(false);
          setOpen(false);
          setCheckOpen(false);
          setTextareaOpen(false);
          setPartyOpen(false);
          setSignOpen(false);
          setDateOpen(false);
          setDateOpen(true);
          setHeaderOpen(false);
          setId1(e.currentTarget.id);
          checkRequired(e);
        } else {
          setDateOpen(false);
          store.set("htmlContent", editor.html.get());
          //handleAutoSave();
        }
        if (e.currentTarget.id[0] === "h") {
          setInputOpen(false);
          setOpen(false);
          setCheckOpen(false);
          setSignOpen(false);
          setTextareaOpen(false);
          setPartyOpen(false);
          setDateOpen(false);
          setHeaderOpen(false);
          setHeaderOpen(true);
          setId1(e.currentTarget.id);
        } else {
          setHeaderOpen(false);
          store.set("htmlContent", editor.html.get());
          //handleAutoSave();
        }
        if (e.currentTarget.id[0] === "s") {
          setInputOpen(false);
          setOpen(false);
          setCheckOpen(false);
          setSignOpen(false);
          setSignOpen(true);
          setTextareaOpen(false);
          setPartyOpen(false);
          setDateOpen(false);
          setHeaderOpen(false);
          setId1(e.currentTarget.id);
          //console.log(e.currentTarget.parentElement.id);
          dragElement(
            document.getElementById(e.currentTarget.parentElement.id),
            e.currentTarget.id
          );
        } else {
          setSignOpen(false);
          store.set("htmlContent", editor.html.get());
          //handleAutoSave();
        }
        if (e.target.localName === "input") {
          inputID = e.target.id;
          document
            .getElementById(inputID)
            .addEventListener("change", myFunction);
        }
      },
      contentChanged: function (e) {
        var editor = this;
        store.set("htmlContent", editor.html.get());
        handleAutoSave();
      },
      keyup: function (e) {
        if (e.currentTarget.id[0] === "i") {
          document
            .getElementById(e.currentTarget.id)
            .setAttribute("value", e.currentTarget.value);
        }
        if (e.currentTarget.id[0] === "p") {
          document
            .getElementById(e.currentTarget.id)
            .setAttribute("value", e.currentTarget.value);
        }
        if (e.currentTarget.id[0] === "t") {
          document
            .getElementById(e.currentTarget.id)
            .setAttribute("value", e.currentTarget.value);
        }
      },

      initialized: function () {
        var editor = this;
        if (store.get("fileInfo")) {
          editor.html.set(store.get("fileInfo")["text"]);
          store.set("htmlContent", editor.html.get());
          handleAutoSave();
        }
        if (store.get("htmlContent")) {
          editor.html.set(store.get("htmlContent"));
        }
        editor.events.on(
          "drop",
          function (dropEvent) {
            editor.markers.insertAtPoint(dropEvent.originalEvent);
            var $marker = editor.$el.find(".fr-marker");
            $marker.replaceWith(Froalaeditor.MARKERS);
            editor.selection.restore();
            if (!editor.undo.canDo()) editor.undo.saveStep();
            if (
              dropEvent.originalEvent.dataTransfer.getData("Text") === "input"
            ) {
              editor.html.insert(
                `
                  <input type="text" id="i${Math.random()}" class="inp">
                `
              );
            }
            if (
              dropEvent.originalEvent.dataTransfer.getData("Text") === "sign"
            ) {
              const val = `s${Math.random()}`;
              editor.html.insert(
                `
                  <div id="${val}" style="position: absolute;z-index: 9;text-align: center;border: 1px solid black;">
										<canvas id="${val}header" style="cursor: move;"></canvas>
									</div>
                `
              );
            }

            if (
              dropEvent.originalEvent.dataTransfer.getData("Text") ===
              "dropdown"
            ) {
              editor.html.insert(`
                    <select id="d${Math.random()}" class="select">
                    </select>
                `);
            }
            if (
              dropEvent.originalEvent.dataTransfer.getData("Text") === "check"
            ) {
              editor.html.insert(
                `<input id="c${Math.random()}" type="checkbox">`
              );
            }
            if (
              dropEvent.originalEvent.dataTransfer.getData("Text") === "party"
            ) {
              editor.html.insert(`
								<div>
									<input type="text" id="pfname${Math.random()}" class="inp" placeholder='First Name'><br/><br/>
									<input type="text" id="pmname${Math.random()}" class="inp" placeholder='Middle Name'><br/><br/>
									<input type="text" id="plname${Math.random()}" class="inp" placeholder='Last Name'><br/><br/>
									<input type="date" id="pdob${Math.random()}" class="inp" placeholder='Date of Birth'><br/><br/>
									<input type="number" id="pnumber${Math.random()}" class="inp" placeholder='Mobile Number'><br/><br/>
									<input type="email" id="pmail${Math.random()}" class="inp" placeholder='Email Address'><br/><br/>
									<input type="text" id="psdw${Math.random()}" class="inp" placeholder='S/O,D/O,W/O'><br/><br/>
								</div>
							`);
            }
            if (
              dropEvent.originalEvent.dataTransfer.getData("Text") ===
              "textarea"
            ) {
              editor.html.insert(`
								<input type="textarea" id="t${Math.random()}">
							`);
            }
            if (
              dropEvent.originalEvent.dataTransfer.getData("Text") === "date"
            ) {
              editor.html.insert(`
								<input type="date" id="z${Math.random()}" class="inp">
							`);
            }
            if (
              dropEvent.originalEvent.dataTransfer.getData("Text") === "header"
            ) {
              editor.html.insert(`
								<div>
									<h1 id="h${Math.random()}"></h1>
								</div>
							`);
            }
            editor.undo.saveStep();
            dropEvent.preventDefault();
            dropEvent.stopPropagation();
            if (editor.core.hasFocus() && editor.browser.mozilla) {
              editor.events.disableBlur();
              setTimeout(function () {
                editor.$el.blur().focus();
                editor.events.enableBlur();
              }, 0);
            }

            return false;
          },
          true
        );
      },
    },
  };

  const handleDelete = () => {
    if (id1[0] === "s") {
      document.getElementById(id1).parentElement.remove();
      setSignOpen(false);
    } else {
      document.getElementById(id1).remove();
      if (id1[0] === "d") {
        setOpen(false);
      }
      if (id1[0] === "i") {
        setInputOpen(false);
      }
      if (id1[0] === "c") {
        setInputOpen(false);
      }
      if (id1[0] === "p") {
        setPartyOpen(false);
      }
      if (id1[0] === "z") {
        setDateOpen(false);
      }
      if (id1[0] === "t") {
        setTextareaOpen(false);
      }
      if (id1[0] === "h") {
        setHeaderOpen(false);
      }
    }
  };

  const handleCloseAll = () => {
    setOpen(false);
    setInputOpen(false);
    setInputOpen(false);
    setPartyOpen(false);
    setDateOpen(false);
    setTextareaOpen(false);
    setHeaderOpen(false);
    setSignOpen(false);
  };

  const handleSave = () => {
    setOpen(false);
    setInputOpen(false);
    setCheckOpen(false);
  };

  const defaultState = {
    can_review: false,
    can_edit: false,
    can_fill: false,
    can_sign: false,
  };
  const defaultValues = {
    first_name: "",
    last_name: "",
    mobile: "",
    email: "",
  };
  const [state, setState] = useState(defaultState);
  const [values, setValues] = useState(defaultValues);
  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };
  const handleValuesChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };
  const handleShare = () => {
    if (values.email === "" && values.mobile === "") {
      message.error("Email or Mobile Field is required");
    } else {
      const id = store.get("fileInfo")["id"];
      setBdOpen(true);
      var bodyFormData = new FormData();
      bodyFormData.append("token", store.get("digi_token"));
      bodyFormData.append("email", values.email);
      bodyFormData.append("first_name", values.first_name);
      bodyFormData.append("last_name", values.last_name);
      bodyFormData.append("mobile", values.mobile);
      bodyFormData.append("template_id", id);
      bodyFormData.append("type", isDocument);
      bodyFormData.append("can_edit", state.can_edit ? "yes" : "");
      bodyFormData.append("can_fill", state.can_fill ? "yes" : "");
      bodyFormData.append("can_review", state.can_review ? "yes" : "");
      bodyFormData.append("can_sign", state.can_sign ? "yes" : "");
      fetch(`${url}/admin_git/digitalsignature/public/api/templateshare`, {
        method: "POST",
        body: bodyFormData,
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            fetch(
              `${url}/admin_git/digitalsignature/public/api/templates/${id}`,
              {
                method: "GET",
              }
            )
              .then((res1) => res1.json())
              .then((res1) => {
                if (res1.data[0].status === "pending_update") {
                  fetch(
                    `${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=pending_update&guest_user_id=${
                      store.get("digi_user")["id"]
                    }&token=${store.get("digi_token")}`,
                    {
                      method: "POST",
                    }
                  )
                    .then(() => {
                      setBdOpen(false);
                      message.success(res.message);
                    })
                    .catch(() => {
                      setBdOpen(false);
                      message.error("Something Went Wrong");
                    });
                }
                if (res1.data[0].status === "approved") {
                  fetch(
                    `${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=approved&guest_user_id=${
                      store.get("digi_user")["id"]
                    }&token=${store.get("digi_token")}`,
                    {
                      method: "POST",
                    }
                  )
                    .then(() => {
                      setBdOpen(false);
                      message.success(res.message);
                    })
                    .catch(() => {
                      setBdOpen(false);
                      message.error("Something Went Wrong");
                    });
                }
                if (res1.data[0].status === "in_progress") {
                  fetch(
                    `${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=in_progress&guest_user_id=${
                      store.get("digi_user")["id"]
                    }&token=${store.get("digi_token")}`,
                    {
                      method: "POST",
                    }
                  )
                    .then(() => {
                      setBdOpen(false);
                      message.success(res.message);
                    })
                    .catch(() => {
                      setBdOpen(false);
                      message.error("Something Went Wrong");
                    });
                }
                if (res1.data[0].status === "in_review") {
                  fetch(
                    `${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=in_review&guest_user_id=${
                      store.get("digi_user")["id"]
                    }&token=${store.get("digi_token")}`,
                    {
                      method: "POST",
                    }
                  )
                    .then(() => {
                      setBdOpen(false);
                      message.success(res.message);
                    })
                    .catch(() => {
                      setBdOpen(false);
                      message.error("Something Went Wrong");
                    });
                }
                if (res1.data[0].status === "draft") {
                  fetch(
                    `${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=in_review&guest_user_id=${
                      store.get("digi_user")["id"]
                    }&token=${store.get("digi_token")}`,
                    {
                      method: "POST",
                    }
                  )
                    .then(() => {
                      setBdOpen(false);
                      message.success(res.message);
                    })
                    .catch(() => {
                      setBdOpen(false);
                      message.error("Something Went Wrong");
                    });
                }
              });
          } else {
            setBdOpen(false);
            message.error(res.message);
          }
          setState(defaultState);
          setValues(defaultValues);
        })
        .catch((error) => {
          console.log(error);
          setBdOpen(false);
          message.error("Something Went Wrong");
        });
    }
  };

  const [visible, setVisible] = useState(false);
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const handleRatings = (e) => {
    e.preventDefault();
    fetch(
      `${url}/admin_git/digitalsignature/public/api/rate/template?token=${store.get(
        "digi_token"
      )}&template_id=${store.get("fileInfo")["id"]}&rating=${rating}`,
      {
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then(() => {
        window.history.replaceState(
          null,
          "",
          window.location.href.split("?")[0]
        );
      })
      .catch((err) => {
        if (err.response.status === 401) {
          message.error("Session Timed Out..Kindly Login Again!!");
          store.clearAll();
          history.push("/login");
        } else {
          message.error("Something Went Wrong");
          console.log(err);
        }
      });
  };

  const [teamsPage, setTeamsPage] = useState(0);
  const [teamsRowsPerPage, setTeamsRowsPerPage] = useState(5);

  const handleChangeTeamsPage = (event, newPage) => {
    setTeamsPage(newPage);
  };

  const handleChangeTeamsRowsPerPage = (event) => {
    setTeamsRowsPerPage(parseInt(event.target.value, 10));
    setTeamsPage(0);
  };

  const [teamVisible, setTeamVisible] = useState(false);
  const [memberVisible, setMemberVisible] = useState(false);
  const [teamProcessing, setTeamProcessing] = useState(false);
  const [memberProcessing, setMemberProcessing] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamId, setTeamId] = useState(0);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [addVisible, setAddVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const defaultMemberState = {
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
  };
  const [memberState, setMemberState] = useState(defaultMemberState);

  const handleMemberChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setMemberState({ ...memberState, [name]: value });
  };

  const handleMemberSubmit = (e) => {
    e.preventDefault();
    setAddLoading(true);
    var bodyFormData = new FormData();
    bodyFormData.append("token", store.get("digi_token"));
    bodyFormData.append("teams_id", teamId);
    bodyFormData.append("first_name", memberState.first_name);
    bodyFormData.append("last_name", memberState.last_name);
    bodyFormData.append("email", memberState.email);
    bodyFormData.append("mobile", memberState.mobile);
    fetch(`${url}/admin_git/digitalsignature/public/api/addteamsmember`, {
      method: "POST",
      body: bodyFormData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          setAddLoading(!true);
          message.error(res.error.message);
        } else {
          setAddLoading(!true);
          message.success(res.message);
          setMemberState(defaultMemberState);
          setAddVisible(false);
          setMemberVisible(true);
          getMembers(teamId);
        }
      })
      .catch((err) => {
        if (err.response.status === 401) {
          setAddLoading(!true);
          message.error("Session Timed Out..Kindly Login Again!!");
          store.clearAll();
          history.push("/login");
        } else {
          setAddLoading(!true);
          message.error("Something Went Wrong");
          console.log(err);
        }
      });
  };

  const getTeams = () => {
    setTeamProcessing(true);
    axios
      .get(`${url}/admin_git/digitalsignature/public/api/teams`, {
        params: {
          token: store.get("digi_token"),
        },
      })
      .then((res) => {
        const teamsTransformData = res.data.data.data.map((data) => ({
          id: data.id,
          title: data.title,
          created_at: data.created_at.split(" ")[0],
        }));
        teamsTransformData.sort(function (a, b) {
          if (a.title < b.title) {
            return -1;
          }
          if (a.title > b.title) {
            return 1;
          }
          return 0;
        });
        setTeams(teamsTransformData);
        setTeamProcessing(false);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          setTeamProcessing(false);
          message.error("Session Timed Out..Kindly Login Again!!");
          store.clearAll();
          history.push("/login");
        } else {
          setTeamProcessing(false);
          message.error("Something Went Wrong");
          console.log(err);
        }
      });
  };

  const getMembers = (id) => {
    setMemberProcessing(true);
    axios
      .get(
        `${url}/admin_git/digitalsignature/public/api/teams/listmember/${id}`,
        {
          params: {
            token: store.get("digi_token"),
          },
        }
      )
      .then((res) => {
        const transformData = res.data.data[0].teammember.filter(
          (data) => data.status === "active"
        );
        setMembers(transformData);
        setMemberProcessing(!true);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          setMemberProcessing(!true);
          message.error("Session Timed Out..Kindly Login Again!!");
          store.clearAll();
          history.push("/login");
        } else {
          setMemberProcessing(!true);
          message.error("Something Went Wrong");
          console.log(err);
        }
      });
  };

  const [checkStatus, setCheckStatus] = useState([]);
  const handleTeamCheckbox = (
    checkedValues,
    email,
    mobile,
    last_name,
    first_name
  ) => {
    const value = [...checkStatus];
    const obj = value.filter((data) => email === data.email);
    if (obj.length === 0) {
      value.push({ email, mobile, last_name, first_name, checkedValues });
      setCheckStatus(value);
    } else {
      const objIndex = value.findIndex((obj) => email === obj.email);
      value[objIndex].checkedValues = checkedValues;
      setCheckStatus(value);
    }
  };

  const handleTeamShare = (e) => {
    e.preventDefault();
    setBdOpen(true);
    const id = store.get("fileInfo")["id"];
    var bodyFormData = new FormData();
    bodyFormData.append("token", store.get("digi_token"));
    bodyFormData.append("members", JSON.stringify(checkStatus));
    bodyFormData.append("template_id", id);
    bodyFormData.append("team_id", teamId);
    bodyFormData.append("type", "document");
    fetch(`${url}/admin_git/digitalsignature/public/api/templateshare/team`, {
      method: "POST",
      body: bodyFormData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          fetch(
            `${url}/admin_git/digitalsignature/public/api/templates/${id}`,
            {
              method: "GET",
            }
          )
            .then((res1) => res1.json())
            .then((res1) => {
              if (res1.data[0].status === "pending_update") {
                fetch(
                  `${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=pending_update&guest_user_id=${
                    store.get("digi_user")["id"]
                  }&token=${store.get("digi_token")}`,
                  {
                    method: "POST",
                  }
                )
                  .then(() => {
                    setBdOpen(false);
                    setMemberVisible(false);
                    message.success(res.message);
                  })
                  .catch(() => {
                    setBdOpen(false);
                    message.error("Something Went Wrong");
                  });
              }
              if (res1.data[0].status === "approved") {
                fetch(
                  `${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=approved&guest_user_id=${
                    store.get("digi_user")["id"]
                  }&token=${store.get("digi_token")}`,
                  {
                    method: "POST",
                  }
                )
                  .then(() => {
                    setBdOpen(false);
                    setMemberVisible(false);
                    message.success(res.message);
                  })
                  .catch(() => {
                    setBdOpen(false);
                    message.error("Something Went Wrong");
                  });
              }
              if (res1.data[0].status === "in_progress") {
                fetch(
                  `${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=in_progress&guest_user_id=${
                    store.get("digi_user")["id"]
                  }&token=${store.get("digi_token")}`,
                  {
                    method: "POST",
                  }
                )
                  .then(() => {
                    setBdOpen(false);
                    setMemberVisible(false);
                    message.success(res.message);
                  })
                  .catch(() => {
                    setBdOpen(false);
                    message.error("Something Went Wrong");
                  });
              }
              if (res1.data[0].status === "in_review") {
                fetch(
                  `${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=in_review&guest_user_id=${
                    store.get("digi_user")["id"]
                  }&token=${store.get("digi_token")}`,
                  {
                    method: "POST",
                  }
                )
                  .then(() => {
                    setBdOpen(false);
                    setMemberVisible(false);
                    message.success(res.message);
                  })
                  .catch(() => {
                    setBdOpen(false);
                    message.error("Something Went Wrong");
                  });
              }
              if (res1.data[0].status === "draft") {
                fetch(
                  `${url}/admin_git/digitalsignature/public/api/statuschange?id=${id}&status=in_review&guest_user_id=${
                    store.get("digi_user")["id"]
                  }&token=${store.get("digi_token")}`,
                  {
                    method: "POST",
                  }
                )
                  .then(() => {
                    setBdOpen(false);
                    setMemberVisible(false);
                    message.success(res.message);
                  })
                  .catch(() => {
                    setBdOpen(false);
                    message.error("Something Went Wrong");
                  });
              }
            });
        } else {
          setBdOpen(false);
          message.error(res.message);
        }
        setCheckStatus([]);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          setBdOpen(false);
          message.error("Session Timed Out..Kindly Login Again!!");
          store.clearAll();
          history.push("/login");
        } else {
          setBdOpen(false);
          message.error("Something Went Wrong");
          console.log(err);
        }
      });
  };
  return (
    <>
      <Modal
        title="Kindly Comment And Rate this Template"
        visible={visible}
        //onOk={(e) => handleTeamEdit()}
        footer={[
          <Button
            key="submit"
            type="primary"
            data-dismiss="modal"
            data-toggle="modal"
            data-target=".down-share"
            style={{ backgroundColor: "#05C6FF", color: "#fff" }}
            onClick={(e) => {
              setComment("");
              setRating(0);
              handleRatings(e);
              setVisible(false);
            }}
          >
            {comment || rating ? `Next` : "Skip"}
          </Button>,
        ]}
      >
        <Form name="userForm" {...layout}>
          <Form.Item label="Comment" rules={[{ required: true }]}>
            <TextArea
              rows={4}
              onChange={(e) => setComment(e.target.value)}
              value={comment}
            />
          </Form.Item>
          <Form.Item label="Ratings" rules={[{ required: true }]}>
            <Rate
              allowHalf
              value={rating}
              onChange={(value) => {
                setRating(value);
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Select Team"
        visible={teamVisible}
        onCancel={() => {
          setTeamVisible(false);
        }}
        width={800}
        footer={[
          <Button
            key="back"
            style={{ backgroundColor: "#05C6FF" }}
            onClick={() => {
              setTeamVisible(false);
            }}
            data-toggle="modal"
            data-target=".pop-share"
            type="primary"
          >
            Back
          </Button>,
        ]}
      >
        {teamProcessing ? (
          <center>
            <Circle color="black" size={80} />
          </center>
        ) : (
          <table
            id="datatable"
            className="table dt-responsive nowrap"
            style={{
              borderCollapse: "collapse",
              borderSpacing: "0",
              width: "100%",
              textAlign: "center",
            }}
          >
            {teams.length === 0 ? (
              <tr>
                <td colSpan={4} align="center">
                  <Empty />
                </td>
              </tr>
            ) : (
              <>
                <thead>
                  <tr>
                    <TablePagination
                      rowsPerPageOptions={[
                        5,
                        10,
                        15,
                        { label: "All", value: -1 },
                      ]}
                      tabIndex={-1}
                      count={teams.length}
                      rowsPerPage={teamsRowsPerPage}
                      page={teamsPage}
                      SelectProps={{
                        inputProps: {
                          "aria-label": "rows per page",
                        },
                        native: true,
                      }}
                      onChangePage={handleChangeTeamsPage}
                      onChangeRowsPerPage={handleChangeTeamsRowsPerPage}
                    />
                  </tr>
                  <tr>
                    <th>Team Id</th>
                    <th>Title</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {(teamsRowsPerPage > 0
                    ? teams.slice(
                        teamsPage * teamsRowsPerPage,
                        teamsPage * teamsRowsPerPage + teamsRowsPerPage
                      )
                    : teams
                  ).map((data) => (
                    <tr key={data.id}>
                      <td>{data.id}</td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setTeamId(data.id);
                          getMembers(data.id);
                          setTeamName(data.title);
                          setTeamVisible(false);
                          setMemberVisible(true);
                        }}
                      >
                        {data.title}
                      </td>
                      <td>{data.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        )}
      </Modal>
      <Modal
        title={`Share With ${teamName}`}
        visible={memberVisible}
        onCancel={() => {
          setMemberVisible(false);
          setCheckStatus([]);
        }}
        width={1000}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setMemberVisible(false);
              setTeamVisible(true);
              setCheckStatus([]);
            }}
          >
            Back
          </Button>,
          <Button
            key="submit"
            type="primary"
            style={{ backgroundColor: "#05C6FF" }}
            // disabled={checkStatus === 0}
            onClick={(e) => {
              // setMemberVisible(false);
              // setTeamVisible(true);
              setCheckStatus([]);
              handleTeamShare(e);
            }}
          >
            Share
          </Button>,
        ]}
      >
        {memberProcessing ? (
          <center>
            <Circle color="black" size={80} />
          </center>
        ) : (
          <>
            <Button
              type="primary"
              onClick={() => {
                setMemberVisible(false);
                setAddVisible(true);
              }}
              style={{
                backgroundColor: "#05C6FF",
                marginRight: "10px",
                marginBottom: "10px",
                float: "right",
              }}
            >
              Add a Member
            </Button>
            <TableContainer style={{ maxHeight: "330px" }}>
              <Table
                stickyHeader
                style={{
                  borderCollapse: "collapse",
                  borderSpacing: "0",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Empty />
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Member's Id</TableCell>
                        <TableCell align="center">Full Name</TableCell>
                        <TableCell align="center">Email</TableCell>
                        <TableCell align="center">Permissions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {members.map((data) => (
                        <TableRow key={data.id}>
                          <TableCell align="center">{data.id}</TableCell>
                          <TableCell align="center">{`${data?.first_name} ${data?.last_name}`}</TableCell>
                          <TableCell align="center">{data?.email}</TableCell>
                          <TableCell align="center">
                            <Checkbox.Group
                              onChange={(checkedValues) =>
                                handleTeamCheckbox(
                                  checkedValues,
                                  data.email,
                                  data.mobile,
                                  data.last_name,
                                  data.first_name
                                )
                              }
                            >
                              <Checkbox value={`can_review`}>Review</Checkbox>
                              <Checkbox value={`can_edit`}>Edit</Checkbox>
                              {isDocument === "document" && (
                                <>
                                  <Checkbox value={`can_fill`}>Fill</Checkbox>
                                  <Checkbox value={`can_sign`}>Sign</Checkbox>
                                </>
                              )}
                            </Checkbox.Group>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </>
                )}
              </Table>
            </TableContainer>
          </>
        )}
      </Modal>
      <Modal
        title={`Add Member to ${teamName}`}
        visible={addVisible}
        onCancel={() => {
          setAddVisible(false);
        }}
        width={800}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setAddVisible(false);
              setMemberVisible(true);
            }}
          >
            Back
          </Button>,
          <Button
            key="submit"
            htmlType="submit"
            disabled={
              !memberState.email ||
              !memberState.first_name ||
              !memberState.last_name ||
              !memberState.mobile
            }
            loading={addLoading}
            //style={{ backgroundColor: '#05C6FF', color: 'white' }}
            onClick={(e) => {
              handleMemberSubmit(e);
            }}
            type="primary"
          >
            Submit
          </Button>,
        ]}
      >
        <form onSubmit={handleMemberSubmit}>
          <Row>
            <Col span={12}>
              <div className="anchovy-form-item">
                <label className="validated-input">
                  First Name
                  <input
                    className="input-group"
                    value={memberState.first_name}
                    name="first_name"
                    onChange={handleMemberChange}
                    type="text"
                    required
                  />
                </label>
              </div>
            </Col>
            <Col span={12}>
              <div className="anchovy-form-item">
                <label className="validated-input">
                  Last Name
                  <input
                    className="input-group"
                    value={memberState.last_name}
                    name="last_name"
                    onChange={handleMemberChange}
                    type="text"
                    required
                  />
                </label>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <div className="anchovy-form-item">
                <label className="validated-input">
                  Email
                  <input
                    className="input-group"
                    value={memberState.email}
                    name="email"
                    onChange={handleMemberChange}
                    type="email"
                    required
                  />
                </label>
              </div>
            </Col>
            <Col span={12}>
              <div className="anchovy-form-item">
                <label className="validated-input">
                  Mobile Number
                  <input
                    className="input-group"
                    value={memberState.mobile}
                    name="mobile"
                    onChange={handleMemberChange}
                    type="text"
                    maxLength="10"
                    required
                  />
                </label>
              </div>
            </Col>
          </Row>
        </form>
      </Modal>
      <div id="layout-wrapper">
        <header id="page-topbar">
          <div className="navbar-header">
            <div className="d-flex">
              <div className="navbar-brand-box">
                <Link to="/dashboard" className="logo logo-dark">
                  <span className="logo-sm">
                    <img
                      src={process.env.PUBLIC_URL + "/assets/images/logo.svg"}
                      alt=""
                      height="22"
                    />
                  </span>
                  <span className="logo-lg">
                    <img
                      src={
                        process.env.PUBLIC_URL + "/assets/images/logo-dark.png"
                      }
                      alt=""
                      height="17"
                    />
                  </span>
                </Link>

                <Link to="/dashboard" className="logo logo-light">
                  <span className="logo-sm">
                    <img
                      src={
                        process.env.PUBLIC_URL + "/assets/images/logo-sm.png"
                      }
                      alt=""
                      height="22"
                    />
                  </span>
                  <span className="logo-lg">
                    <img
                      src={
                        process.env.PUBLIC_URL + "/assets/images/logo-light.png"
                      }
                      alt=""
                      height=""
                    />
                  </span>
                </Link>
              </div>

              <button
                type="button"
                class="btn btn-sm px-3 font-size-24 header-item waves-effect"
                id="vertical-navmenu-btn"
              >
                <i class="mdi mdi-menu"></i>
              </button>
              <div className="d-none d-sm-block">
                <h4 className="font-size-18" style={{ marginTop: "19px" }}>
                  <ContentEditable
                    html={fileName.current}
                    onChange={handleFileName}
                    className="file-name"
                    ref={fileName}
                  />
                </h4>
              </div>
            </div>

            <div className="d-flex">
              <div className="dropdown d-inline-block">
                <span>{TextTrackList}</span>
                <button
                  className="btn create-new btn-primary dropdown-toggle waves-effect waves-light"
                  type="button"
                  data-toggle="modal"
                  data-target=".save-popp"
                  onClick={handleSave}
                >
                  Save As
                </button>

                <div>
                  <div
                    className="modal fade save-popp"
                    tabIndex={-1}
                    role="dialog"
                    aria-labelledby="mySmallModalLabel"
                    aria-hidden="true"
                  >
                    <div className="modal-dialog modal-sm">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5
                            className="modal-title mt-0"
                            id="mySmallModalLabel"
                          >
                            Save as
                          </h5>
                        </div>
                        {store.get("fileInfo")["type"] === "template" ||
                        store.get("fileInfo")["type"] === "document" ? (
                          <div className="modal-body">
                            <div className="radio-btn">
                              <RadioGroup
                                aria-label="doctype"
                                name="doctype"
                                value={isDocument}
                                onChange={handleClick}
                                row
                              >
                                <span>
                                  <FormControlLabel
                                    value="template"
                                    control={<Radio color="primary" />}
                                    label="Template"
                                  />
                                </span>{" "}
                                <span style={{ textAlign: "right" }}>
                                  <FormControlLabel
                                    value="document"
                                    control={<Radio color="primary" />}
                                    label="Document"
                                  />
                                </span>
                              </RadioGroup>
                            </div>
                            {isDocument === "document" && (
                              <div className="fields-input-save">
                                <div className="form-group">
                                  <input
                                    id="ui-test-start-date"
                                    className="form-control"
                                    name="startDate"
                                    data-ui-test="first-start-date"
                                    type="date"
                                    min={moment().format("YYYY-MM-DD")}
                                    onChange={handleStartDate}
                                    // min={startDate}
                                    max={endDate}
                                    required
                                    value={startDate !== null && startDate}
                                  />
                                </div>
                                <div className="form-group">
                                  <input
                                    id="ui-test-end-date"
                                    className="form-control"
                                    name="endDate"
                                    data-ui-test="first-end-date"
                                    type="date"
                                    min={
                                      startDate === null
                                        ? moment().format("YYYY-MM-DD")
                                        : startDate
                                    }
                                    value={endDate !== null && endDate}
                                    disabled={!startDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <input
                                    className="form-control"
                                    name="docType"
                                    type="text"
                                    placeholder="Document type"
                                    value={docType === "null" ? "" : docType}
                                    onChange={(e) => setDocType(e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <ContentEditable
                                    html={fileName.current}
                                    onChange={handleFileName}
                                    className="form-control"
                                  />
                                </div>
                              </div>
                            )}
                            {urlData.use === "global" ? (
                              <button
                                type="button"
                                data-dismiss="modal"
                                data-toggle="modal"
                                className="btn btn-primary save-share"
                                onClick={() => {
                                  if (urlData.use === "global") {
                                    setVisible(true);
                                  }
                                  handleSubmit();
                                }}
                              >
                                Add Details
                              </button>
                            ) : (
                              <button
                                type="button"
                                data-dismiss="modal"
                                data-toggle="modal"
                                data-target=".down-share"
                                className="btn btn-primary save-share"
                                onClick={() => handleSubmit()}
                              >
                                Add Details
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="modal-body">
                            <div className="fields-input-save">
                              <div className="form-group">
                                <input
                                  id="ui-test-start-date"
                                  className="form-control"
                                  name="startDate"
                                  data-ui-test="first-start-date"
                                  type="date"
                                  min={docStartDate}
                                  max={docEndDate}
                                  required
                                  value={docStartDate}
                                />
                              </div>
                              <div className="form-group">
                                <input
                                  id="ui-test-end-date"
                                  className="form-control"
                                  name="endDate"
                                  data-ui-test="first-end-date"
                                  type="date"
                                  min={docStartDate}
                                  // disabled={disabled}
                                  onChange={(e) =>
                                    setDocEndDate(e.target.value)
                                  }
                                  value={docEndDate}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <input
                                  className="form-control"
                                  name="docType"
                                  type="text"
                                  placeholder="Document type"
                                  value={docType === "null" ? "" : docType}
                                  onChange={(e) => setDocType(e.target.value)}
                                  required
                                />
                              </div>
                              <ContentEditable
                                html={fileName.current}
                                onChange={handleFileName}
                                className="form-control"
                              />

                              <button
                                type="button"
                                data-dismiss="modal"
                                data-toggle="modal"
                                data-target=".down-share"
                                className="btn btn-primary save-share"
                                onClick={handleDocSubmit}
                              >
                                Add Details
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className="modal fade down-share"
                    tabIndex={-1}
                    role="dialog"
                    aria-labelledby="mySmallModalLabel"
                    aria-hidden="true"
                  >
                    <div className="modal-dialog modal-sm">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5
                            className="modal-title mt-0"
                            id="mySmallModalLabel"
                          >
                            {isDocument === "document"
                              ? `Download and Share`
                              : `Share`}
                          </h5>
                        </div>
                        <div className="modal-body">
                          <div className="download-share-btn">
                            {isDocument === "document" && (
                              <button onClick={handleDownload}>
                                {/* <i className='fas fa-download' /> */}
                                <img
                                  onClick={() => handleDownload(data.id)}
                                  src={
                                    process.env.PUBLIC_URL +
                                    "/assets/images/download.png"
                                  }
                                  style={{ height: "60px", width: "60px" }}
                                  alt="download"
                                />
                                <p>Download</p>
                              </button>
                            )}

                            <button
                              type="button"
                              data-dismiss="modal"
                              data-toggle="modal"
                              data-target=".pop-share"
                            >
                              {/* <i className='fas fa-share-square' /> */}
                              <img
                                src={
                                  process.env.PUBLIC_URL +
                                  "/assets/images/share.png"
                                }
                                style={{ height: "60px", width: "60px" }}
                                alt="share"
                              />
                              <p>Share</p>
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* /.modal-content */}
                    </div>
                    {/* /.modal-dialog */}
                  </div>
                  {/* /.modal */}
                  <div
                    className="modal fade pop-share"
                    tabIndex={-1}
                    role="dialog"
                    aria-labelledby="mySmallModalLabel"
                    aria-hidden="true"
                  >
                    <div className="modal-dialog modal-md">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5
                            className="modal-title mt-0"
                            id="mySmallModalLabel"
                          >
                            Share Document
                          </h5>
                        </div>
                        <div className="modal-body">
                          <div className="share-content">
                            <p>
                              <span>Recipients</span>
                              <Button
                                type="primary"
                                icon={
                                  <TeamOutlined style={{ fontSize: "20px" }} />
                                }
                                style={{ backgroundColor: "#05C6FF" }}
                                onClick={() => {
                                  getTeams();
                                  setTeamVisible(true);
                                }}
                                data-dismiss="modal"
                              >
                                Share with Team
                              </Button>
                            </p>
                          </div>
                          <div className="fisr-last-name">
                            <div className="form-group">
                              <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                value={values.email}
                                onChange={handleValuesChange}
                                name="email"
                              />
                            </div>
                            <div className="form-group">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Mobile Number"
                                value={values.mobile}
                                onChange={handleValuesChange}
                                name="mobile"
                              />
                            </div>
                          </div>
                          <div className="fisr-last-name">
                            <div className="form-group">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="First name"
                                value={values.first_name}
                                onChange={handleValuesChange}
                                name="first_name"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Last name"
                                value={values.last_name}
                                onChange={handleValuesChange}
                                name="last_name"
                                required
                              />
                            </div>
                          </div>
                          <div className="actions-check">
                            <p>Action</p>
                            <input
                              type="checkbox"
                              checked={state.can_review}
                              onChange={handleChange}
                              name="can_review"
                              id="can_review"
                            />{" "}
                            <span>Review</span>
                            <input
                              type="checkbox"
                              checked={state.can_edit}
                              onChange={handleChange}
                              name="can_edit"
                              id="can_edit"
                            />{" "}
                            <span>Edit</span>
                            {isDocument === "document" && (
                              <>
                                <input
                                  type="checkbox"
                                  checked={state.can_fill}
                                  onChange={handleChange}
                                  name="can_fill"
                                  id="can_fill"
                                />{" "}
                                <span>Fill</span>
                                <input
                                  type="checkbox"
                                  checked={state.can_sign}
                                  onChange={handleChange}
                                  name="can_sign"
                                  id="can_sign"
                                />{" "}
                                <span>Sign</span>
                              </>
                            )}
                          </div>
                          <button
                            type="submit"
                            className="btn btn-primary save-share"
                            onClick={handleShare}
                            data-dismiss="modal"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                      {/* /.modal-content */}
                    </div>
                    {/* /.modal-dialog */}
                  </div>
                  {/* /.modal */}
                </div>
              </div>

              <div className="dropdown d-inline-block">
                <div className="dropdown d-inline-block">
                  <button
                    type="button"
                    className="btn header-item noti-icon waves-effect"
                  >
                    <img
                      src={process.env.PUBLIC_URL + "/assets/images/qmark.png"}
                      alt=""
                    />
                  </button>
                </div>
                <button
                  type="button"
                  className="btn header-item waves-effect"
                  id="page-header-user-dropdown"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <img
                    className="rounded-circle header-profile-user"
                    src={data["profile_pic"]}
                    alt=""
                  />
                </button>
                <div
                  className="dropdown-menu dropdown-menu-right"
                  onClick={(e) => handleCloseAll()}
                  id="d"
                >
                  <Link className="dropdown-item" to="/profile">
                    {/* <i className='mdi mdi-account-circle font-size-17 align-middle mr-1'></i> */}
                    <AccountCircleOutlinedIcon fontSize="small" />
                    {"  "}
                    Profile
                  </Link>
                  <Link className="dropdown-item d-block" to="/billing">
                    {/* <i className='mdi mdi-settings font-size-17 align-middle mr-1'></i> */}
                    <AccountBalanceWalletOutlinedIcon fontSize="small" />
                    {"  "}
                    Billing
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item text-danger"
                    onClick={signOut}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="bx bx-power-off font-size-17 align-middle mr-1 text-danger"></i>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="vertical-menubar">
          <div data-simplebar className="h-100">
            <div id="sidebar-navbar-menu">
              <ul className="metismenu list-unstyled" id="side-menu">
                <li>
                  <Link to="/dashboard" className="waves-effect">
                    <i className="fas fa-home"></i>
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    //href=''
                    to="/document"
                    //onClick={() => history.push('/document')}
                    className="waves-effect"
                  >
                    <i className="far fa-file-alt"></i>
                    <span>Documents</span>
                  </Link>
                </li>
                <li>
                  <Link to="/template" className="waves-effect">
                    <i className="fas fa-list-alt"></i>
                    <span>Template</span>
                  </Link>
                </li>
                <li>
                  <Link to="/members" className="waves-effect">
                    <i className="fas fa-users"></i>
                    <span>Teams</span>
                  </Link>
                </li>
                <li>
                  <Link className="waves-effect" to={undefined}>
                    <i className="fas fa-folder-plus"></i>
                    <span>Library</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="main-content" style={{ marginLeft: "0px" }}>
          <div className="page-content editor-page">
            <div className="container-fluid">
              <div className="row">
                <div
                  className="col-sm-9"
                  style={{
                    position: "fixed",
                    height: "100%",
                    background: "#efedec",
                    overflowX: "scroll",
                    paddingLeft: "58px",
                    paddingTop: "20px",
                  }}
                >
                  <div className="blank-layout">
                    <div className="form-group">
                      <FroalaEditor config={editorConfig} />
                      <div></div>
                    </div>
                  </div>
                </div>
                {open && (
                  <div
                    className="col-sm-3"
                    style={{
                      position: "fixed",
                      right: 0,
                      height: "100%",
                      background: "#fff",
                      overflowX: "scroll",
                      zIndex: "99999999",
                    }}
                  >
                    <h5 className="cnt-hd">
                      Dropdown{" "}
                      <span>
                        <CloseOutlined
                          onClick={() => setOpen(false)}
                          style={{ cursor: "pointer" }}
                        />
                      </span>
                    </h5>
                    <div className="element-setting">
                      <div className="form-group">
                        <label>Required</label>
                        <p>
                          This field is required{" "}
                          <label htmlFor="dropdownRequired" className="switch">
                            <input
                              type="checkbox"
                              id="dropdownRequired"
                              name="dropdownRequired"
                              onClick={handleRequired}
                            />
                            <span className="slider round"></span>
                          </label>
                        </p>
                      </div>
                      <div className="form-group dropdown-add">
                        <label>Dropdown Items</label>
                        <input
                          type="text"
                          className="form-control"
                          id="input1"
                          placeholder="Item add"
                        />
                        <Link
                          onClick={handleOption}
                          style={{ cursor: "pointer" }}
                          className="add-item"
                        >
                          Add
                        </Link>

                        <span id="opt"></span>
                      </div>

                      <Popconfirm
                        title="Do you Want to Delete this Field?"
                        onConfirm={handleDelete}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                      >
                        <Link className="btn btn-primary delete-fld">
                          Delete Field
                        </Link>
                      </Popconfirm>
                    </div>
                  </div>
                )}
                {inputOpen && (
                  <div
                    className="col-sm-3"
                    style={{
                      position: "fixed",
                      right: "0",
                      height: "100%",
                      background: "#fff",
                      overflowX: "scroll",
                      zIndex: "9999",
                    }}
                  >
                    <h5 className="cnt-hd">
                      Settings{" "}
                      <span>
                        <CloseOutlined
                          onClick={() => setInputOpen(false)}
                          style={{ cursor: "pointer" }}
                        />
                      </span>
                    </h5>
                    <div className="element-setting">
                      <div className="form-group">
                        <label>Required</label>
                        <p>
                          This field is required{" "}
                          <label className="switch">
                            <input
                              type="checkbox"
                              id="dropdownRequired"
                              name="dropdownRequired"
                              onClick={handleRequired}
                            />
                            <span className="slider round"></span>
                          </label>{" "}
                        </p>
                      </div>

                      <Popconfirm
                        title="Do you Want to Delete this Field?"
                        onConfirm={handleDelete}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                      >
                        <Link className="btn btn-primary delete-fld">
                          Delete Field
                        </Link>
                      </Popconfirm>
                    </div>
                  </div>
                )}
                {partyOpen && (
                  <div
                    className="col-sm-3"
                    style={{
                      position: "fixed",
                      right: "0",
                      height: "100%",
                      background: "#fff",
                      overflowX: "scroll",
                      zIndex: "9999",
                    }}
                  >
                    <h5 className="cnt-hd">
                      Settings{" "}
                      <span>
                        <CloseOutlined
                          onClick={() => setPartyOpen(false)}
                          style={{ cursor: "pointer" }}
                        />
                      </span>
                    </h5>
                    <div className="element-setting">
                      <div className="form-group">
                        <label>Required</label>
                        <p>
                          This field is required{" "}
                          <label className="switch">
                            <input
                              type="checkbox"
                              id="dropdownRequired"
                              name="dropdownRequired"
                              onClick={handleRequired}
                            />
                            <span className="slider round"></span>
                          </label>{" "}
                        </p>
                      </div>

                      <Popconfirm
                        title="Do you Want to Delete this Field?"
                        onConfirm={handleDelete}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                      >
                        <Link className="btn btn-primary delete-fld">
                          Delete Field
                        </Link>
                      </Popconfirm>
                    </div>
                  </div>
                )}
                {textareaOpen && (
                  <div
                    className="col-sm-3"
                    style={{
                      position: "fixed",
                      right: "0",
                      height: "100%",
                      background: "#fff",
                      overflowX: "scroll",
                      zIndex: "9999",
                    }}
                  >
                    <h5 className="cnt-hd">
                      Settings{" "}
                      <span>
                        <CloseOutlined
                          onClick={() => setTextareaOpen(false)}
                          style={{ cursor: "pointer" }}
                        />
                      </span>
                    </h5>
                    <div className="element-setting">
                      <div className="form-group">
                        <label>Required</label>
                        <p>
                          This field is required{" "}
                          <label className="switch">
                            <input
                              type="checkbox"
                              id="dropdownRequired"
                              name="dropdownRequired"
                              onClick={handleRequired}
                            />
                            <span className="slider round"></span>
                          </label>{" "}
                        </p>
                      </div>

                      <Popconfirm
                        title="Do you Want to Delete this Field?"
                        onConfirm={handleDelete}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                      >
                        <Link className="btn btn-primary delete-fld">
                          Delete Field
                        </Link>
                      </Popconfirm>
                    </div>
                  </div>
                )}
                {dateOpen && (
                  <div
                    className="col-sm-3"
                    style={{
                      position: "fixed",
                      right: "0",
                      height: "100%",
                      background: "#fff",
                      overflowX: "scroll",
                      zIndex: "9999",
                    }}
                  >
                    <h5 className="cnt-hd">
                      Settings{" "}
                      <span>
                        <CloseOutlined
                          onClick={() => setDateOpen(false)}
                          style={{ cursor: "pointer" }}
                        />
                      </span>
                    </h5>
                    <div className="element-setting">
                      <div className="form-group">
                        <label>Required</label>
                        <p>
                          This field is required{" "}
                          <label className="switch">
                            <input
                              type="checkbox"
                              id="dropdownRequired"
                              name="dropdownRequired"
                              onClick={handleRequired}
                            />
                            <span className="slider round"></span>
                          </label>{" "}
                        </p>
                      </div>

                      <Popconfirm
                        title="Do you Want to Delete this Field?"
                        onConfirm={handleDelete}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                      >
                        <Link className="btn btn-primary delete-fld">
                          Delete Field
                        </Link>
                      </Popconfirm>
                    </div>
                  </div>
                )}
                {headerOpen && (
                  <div
                    className="col-sm-3"
                    style={{
                      position: "fixed",
                      right: "0",
                      height: "100%",
                      background: "#fff",
                      overflowX: "scroll",
                      zIndex: "9999",
                    }}
                  >
                    <h5 className="cnt-hd">
                      Settings{" "}
                      <span>
                        <CloseOutlined
                          onClick={() => setHeaderOpen(false)}
                          style={{ cursor: "pointer" }}
                        />
                      </span>
                    </h5>
                    <div className="element-setting">
                      <Popconfirm
                        title="Do you Want to Delete this Field?"
                        onConfirm={handleDelete}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                      >
                        <Link className="btn btn-primary delete-fld">
                          Delete Field
                        </Link>
                      </Popconfirm>
                    </div>
                  </div>
                )}
                {signOpen && (
                  <div
                    className="col-sm-3"
                    style={{
                      position: "fixed",
                      right: "0",
                      height: "100%",
                      background: "#fff",
                      overflowX: "scroll",
                      zIndex: "9999",
                    }}
                  >
                    <h5 className="cnt-hd">
                      Settings{" "}
                      <span>
                        <CloseOutlined
                          onClick={() => setSignOpen(false)}
                          style={{ cursor: "pointer" }}
                        />
                      </span>
                    </h5>
                    <div className="element-setting">
                      <Popconfirm
                        title="Do you Want to Delete this Field?"
                        onConfirm={handleDelete}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                      >
                        <a className="btn btn-primary delete-fld">
                          Delete Field
                        </a>
                      </Popconfirm>
                    </div>
                  </div>
                )}
                {checkOpen && (
                  <div
                    className="col-sm-3"
                    style={{
                      position: "fixed",
                      right: "0",
                      height: "100%",
                      background: "#fff",
                      overflowX: "scroll",
                      zIndex: "9999",
                    }}
                  >
                    <h5 className="cnt-hd">
                      Settings{" "}
                      <span>
                        <CloseOutlined
                          onClick={() => setCheckOpen(false)}
                          style={{ cursor: "pointer" }}
                        />
                      </span>
                    </h5>
                    <div className="element-setting">
                      <div className="form-group">
                        <label>Required</label>
                        <p>
                          This field is required{" "}
                          <label className="switch">
                            <input
                              type="checkbox"
                              id="dropdownRequired"
                              name="dropdownRequired"
                              onClick={handleRequired}
                            />
                            <span className="slider round"></span>
                          </label>{" "}
                        </p>
                      </div>
                      <Popconfirm
                        title="Do you Want to Delete this Field?"
                        onConfirm={handleDelete}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                      >
                        <Link className="btn btn-primary delete-fld">
                          Delete Field
                        </Link>
                      </Popconfirm>
                    </div>
                  </div>
                )}
                <div
                  className="col-sm-3"
                  style={{
                    position: "fixed",
                    right: 0,
                    height: "100%",
                    background: "#fff",
                    overflowX: "scroll",
                  }}
                >
                  <h5 className="cnt-hd">Content</h5>
                  <p className="sb-cn fld-span">FIELDS</p>
                  <div className="editor-blocks">
                    <ul>
                      <li
                        draggable="true"
                        id="input"
                        style={{ cursor: "move" }}
                      >
                        Text Field{" "}
                        <span>
                          <TextFieldsIcon />
                        </span>
                      </li>
                      <li
                        draggable="true"
                        id="header"
                        style={{ cursor: "move" }}
                      >
                        Header{" "}
                        <span>
                          <i className="fas fa-text-width" />
                          <span />
                        </span>
                      </li>
                      <li
                        draggable="true"
                        id="dropdown"
                        style={{ cursor: "move" }}
                      >
                        Dropdown{" "}
                        <span id="dropdown">
                          <AssignmentIcon />
                        </span>
                      </li>
                      <li draggable="true" id="sign" style={{ cursor: "move" }}>
                        Signature{" "}
                        <span>
                          <i className="fas fa-file-image" />
                          <span />
                        </span>
                      </li>
                      <li
                        draggable="true"
                        id="check"
                        style={{ cursor: "move" }}
                      >
                        Checkbox{" "}
                        <span>
                          <CheckBoxOutlinedIcon />
                        </span>
                      </li>
                      <li
                        draggable="true"
                        id="party"
                        style={{ cursor: "move" }}
                      >
                        Party Details{" "}
                        <span>
                          <AssignmentIcon />
                        </span>
                      </li>
                      <li
                        draggable="true"
                        id="textarea"
                        style={{ cursor: "move" }}
                      >
                        Textarea{" "}
                        <span>
                          <TextFieldsIcon />
                        </span>
                      </li>
                      <li draggable="true" id="date" style={{ cursor: "move" }}>
                        Date{" "}
                        <span>
                          <DateRangeIcon />
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* )} */}
              </div>
            </div>{" "}
            {/* end row */}
          </div>{" "}
          {/* container-fluid */}
        </div>
        {/* End Page-content */}
      </div>
      {/* end main content*/}
      <div className="rightbar-overlay" />
      <div id="pdf" style={{ fontSize: "30px" }}></div>
      <Backdrop className={classes.backdrop} open={bdOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default Editor;
