const Divider = ({ text = "or" }) => (
  <div className="relative flex py-5 items-center">
    <div className="flex-grow border-t border-slate-200"></div>
    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">{text}</span>
    <div className="flex-grow border-t border-slate-200"></div>
  </div>
);
export default Divider;
