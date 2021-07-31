import React, { useEffect, useState } from "react";
import { message, Skeleton } from "antd";
import store from "store";
import { useHistory } from "react-router-dom";
import { url } from "../url/Url";
import { makeStyles } from "@material-ui/core/styles";
import { Backdrop, CircularProgress } from "@material-ui/core";
import { loadStripe } from "@stripe/stripe-js";
import { Button, Input, Form, Modal } from "antd";
import axios from "axios";
// import { isTokenValid, logout } from "./Utils/TokenExpire";
const { TextArea } = Input;

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 99999,
    color: "#fff",
  },
}));
const PricingHome = () => {
  const history = useHistory();
  const classes = useStyles();
  const [bdOpen, setBdOpen] = useState(!true);

  const handleClick = async (id) => {
    setBdOpen(true);
    const stripePromise = loadStripe(
      "pk_test_51IAs8hG1l2A7NrhSZNkBDc5ewd5WJjTft0Qjz3U86qmFqt2FPgqhwkfpmpOY4CMnlLupYgCJD61N1BdpHpBzjrww00teSpbjWe"
    );
    const stripe = await stripePromise;
    const response = await fetch(
      `${url}/admin_git/digitalsignature/public/api/stripsession?plan_id=${id}&token=${store.get(
        "digi_token"
      )}`,
      {
        method: "POST",
      }
    )
      .then((res) => {})
      .catch((err) => {});
    const session = await response.json();
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
    setBdOpen(false);
    if (result.error) {
      message.error(result.error.message);
    }
  };
  const [plans, setPlans] = useState([]);
  // const [planFeatures, setPlanFeatures] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async function getPlans() {
      setLoading(true);
      const response = await fetch(
        `${url}/admin_git/digitalsignature/public/api/plans`,
        {
          method: "GET",
        }
      )
        .then((res) => res.json())
        .catch((err) => console.log(err, "errorrr"));
      const transformData = response.data.map((data) => ({
        p_days: data.day,
        p_desc: data.description,
        p_id: data.id,
        p_name: data.plan_name,
        p_features: data.planfeatures,
        p_price: data.price,
        p_status: data.status,
      }));
      setPlans(transformData);
      setLoading(!true);
    })();
  }, []);
  const handleRedirect = () => {
    store.set("plan_page", "no");
    history.goBack();
  };
  const [visible, setVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  const defaultValues = {
    email: "",
    name: "",
    mobile: "",
    text: "",
  };
  const [values, setValues] = useState(defaultValues);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleEnquiry = (e) => {
    e.preventDefault();
    if (!values.name) {
      message.error("Name Field is Required");
    } else if (!values.email) {
      message.error("Email Field is Required");
    } else if (!values.text || values.text.length < 10) {
      message.error("Description should be more than 10 words");
    } else {
      setProcessing(true);
      axios
        .post(`${url}/admin_git/digitalsignature/public/api/enqiry/send`, {
          params: {
            name: values.name,
            email: values.email,
            mobile: values.mobile,
            description: values.text,
          },
        })
        .then((res) => {
          if (res.data.success) {
            setProcessing(!true);
            message.success(res.data.message);
            setVisible(false);
            setValues(defaultValues);
          } else {
            setProcessing(!true);
            message.error(res.data.message);
          }
        })
        .catch(() => {
          setProcessing(!true);
          message.error("Something Went Wrong!!");
        });
    }
  };
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };
  return (
    <>
      <Modal
        title="Enquiry Form"
        visible={visible}
        onOk={() => handleEnquiry()}
        onCancel={() => {
          setValues(defaultValues);
          setVisible(false);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setValues(defaultValues);
              setVisible(false);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={processing}
            style={{ backgroundColor: "#05C6FF", color: "#fff" }}
            onClick={handleEnquiry}
          >
            Submit
          </Button>,
        ]}
      >
        <Form name="userForm" {...layout}>
          <Form.Item label="Full Name" key="f1" rules={[{ required: true }]}>
            <Input onChange={handleChange} value={values.name} name="name" />
          </Form.Item>
          <Form.Item label="Email" key="f2" rules={[{ required: true }]}>
            <Input onChange={handleChange} value={values.email} name="email" />
          </Form.Item>
          <Form.Item label="Contact No." key="f3" rules={[{ required: true }]}>
            <Input
              onChange={handleChange}
              value={values.mobile}
              name="mobile"
            />
          </Form.Item>
          <Form.Item label="Description" key="f4">
            <TextArea onChange={handleChange} value={values.text} name="text" />
          </Form.Item>
        </Form>
      </Modal>
      <div className="pricing-page">
        <div className="container">
          <div className="row">
            <div className="col-sm-8">
              {loading ? (
                <Skeleton.Button
                  active={true}
                  style={{ height: "50px", width: "500px" }}
                />
              ) : (
                <h1>Choose Your Digi Agreement Plan</h1>
              )}
              <br></br>
              <br></br>
            </div>
            <div className="col-sm-4 close-panel">
              {loading ? (
                <Skeleton.Button
                  active={true}
                  style={{ height: "50px", width: "50px" }}
                  //size='large'
                />
              ) : (
                <i
                  className="fas fa-times"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRedirect()}
                ></i>
              )}
            </div>
          </div>
        </div>

        <div className="container pricing-option">
          <div className="row">
            {loading ? (
              <Skeleton.Button
                active={true}
                style={{ height: "400px", width: "1140px" }}
              />
            ) : (
              plans.map((data, index) => (
                <React.Fragment key={index}>
                  {data.p_price !== 0 && (
                    <div className="col-sm-4">
                      <div className="pricing-plan">
                        <h2>{data.p_name}</h2>
                        <p>{data.p_desc}</p>
                        <p className="plan-price">
                          {data.p_name !== "Enterprise" ? (
                            <span>₹${data.p_price} / month per user</span>
                          ) : (
                            <span style={{ visibility: "hidden" }}>hello</span>
                          )}
                        </p>
                        <br></br>
                        <button
                          color="primary"
                          className="Button-stqfwa-0 fIKiaq BaseButton-sc-1cop243-0 PrimaryButton-f39pr8-0 jdLCAq jCQELw"
                          type="button"
                          onClick={(e) => {
                            if (data.p_name === "Enterprise") {
                              setVisible(true);
                            } else {
                              handleClick(data.p_id);
                            }
                          }}
                        >
                          Select plan
                        </button>
                        <ul>
                          {data.p_features.map((data1, index1) => (
                            <li key={index1}>
                              <i className="fa fa-check"></i>
                              {data1.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      </div>
      <Backdrop className={classes.backdrop} open={bdOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default PricingHome;
