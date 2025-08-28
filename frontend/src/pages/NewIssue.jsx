import React from "react";
import { useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
const NewIssue = () => {
  const [previewFiles, setPreviewFiles] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const getCameraAccess = async () => {
    setLoadingMedia(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log("Camera accessed");
      // Optionally, display a preview or capture image here.
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Error accessing camera", error);
    }
    setLoadingMedia(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photo = canvas.toDataURL("image/png");
      setCapturedPhoto(photo);
      // Stop the video stream
      const stream = video.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      setShowVideo(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      location: "",
      media: [],
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
      location: Yup.string().required("Location is required"),
    }),
    onSubmit: (values) => {
      console.log("Submitted issue : ", values);
      alert("Issue reported.");
    },
  });

  const files = (event) => {
    const file = Array.from(event.currentTarget.files);
    formik.setFieldValue("media", file);

    const prev = file.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: f.type,
    }));
    setPreviewFiles(prev);
  };
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationStr = `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
        formik.setFieldValue("location", locationStr);
        setLoadingLocation(false);
      },
      (error) => {
        console.error(error);
        alert("Unable to fetch location.");
        setLoadingLocation(false);
      },
    );
  };
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-indigo-500 via-violet-500 to-pink-500 p-5">
        <div className="relative min-h-[600px] w-[500px]">
          <div className="relative min-h-[600px] w-full">
            <form
              onSubmit={formik.handleSubmit}
              className="absolute mt-5 flex min-h-[600px] w-full flex-col justify-start rounded-2xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-2 text-center">
                <h3 className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-2xl font-bold text-transparent">
                  Report a New Issue
                </h3>
              </div>

              <div className="mb-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter issue title"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.title}
                  className="w-full rounded-xl border border-slate-300 px-4 py-1 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
                {formik.touched.title && formik.errors.title ? (
                  <p className="text-xs text-red-500">{formik.errors.title}</p>
                ) : null}
              </div>

              <div className="mb-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Describe the issue"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.description}
                  className="w-full rounded-xl border border-slate-300 px-4 py-1 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                ></textarea>
                {formik.touched.description && formik.errors.description ? (
                  <p className="text-xs text-red-500">
                    {formik.errors.description}
                  </p>
                ) : null}
              </div>

              {/* Location */}
              <div className="mb-2">
                {/* <label className="mb-1 block text-sm font-medium text-slate-700">
                  Add Location Manually
                </label> */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-indigo-600"
                  >
                    {loadingLocation ? "Fetching..." : "Get Location"}
                  </button>
                  <label className="mt-2 block text-sm font-medium text-slate-700">
                    or
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Enter location manually"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.location}
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-1 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                {formik.touched.location && formik.errors.location ? (
                  <p className="text-xs text-red-500">
                    {formik.errors.location}
                  </p>
                ) : null}
              </div>

              <div className="mb-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Upload Media (optional)
                </label>
                <div className="flex">
                  <div className="mt-2 mr-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={getCameraAccess}
                        className="rounded-xl bg-green-500 bg-indigo-500 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-green-600 hover:bg-indigo-600"
                      >
                        {loadingMedia ? "Accessing Camera..." : "Access Camera"}
                      </button>
                      {showVideo && (
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-blue-600"
                        >
                          Capture Photo
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="file"
                    name="media"
                    accept="image/*,video/*"
                    multiple
                    capture="environment"
                    onChange={files}
                    className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-600"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {previewFiles.map((file, i) => (
                      <div key={i} className="relative">
                        {file.type.startsWith("image") ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <video
                            src={file.url}
                            className="h-20 w-28 rounded-lg object-cover"
                            controls
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {showVideo && (
                  <div className="mt-2">
                    <video
                      ref={videoRef}
                      className="w-full max-w-xs"
                      autoPlay
                    />
                    <canvas ref={canvasRef} style={{ display: "none" }} />
                  </div>
                )}

                {capturedPhoto && (
                  <div className="mt-2">
                    <img
                      src={capturedPhoto}
                      alt="Captured"
                      className="w-full max-w-xs"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 font-semibold text-white transition hover:text-black hover:shadow-lg"
              >
                Submit Issue
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewIssue;
