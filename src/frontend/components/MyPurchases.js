import { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MyContext } from "./MyContext";

export default function MyPurchases({ marketplace, nft, account }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const { item, setItem } = useContext(MyContext);

  const detailsHandler = (item) => {
    setItem(item);
    navigate("/details");
  };
  const loadPurchasedItems = async () => {
    // Fetch purchased items from marketplace by quering Offered events with the buyer set as the user
    const filter = marketplace.filters.Bought(
      null,
      null,
      null,
      null,
      null,
      account
    );
    const results = await marketplace.queryFilter(filter);
    //Fetch metadata of each nft and add that to listedItem object.
    const purchases = await Promise.all(
      results.map(async (i) => {
        // fetch arguments from each result
        i = i.args;
        // get uri url from nft contract
        const uri = await nft.tokenURI(i.tokenId);
        // use uri to fetch the nft metadata stored on ipfs
        const response = await fetch(uri);
        const metadata = await response.json();
        // get total price of item (item price + fee)
        const totalPrice = await marketplace.getTotalPrice(i.itemId);
        // define listed item object
        let purchasedItem = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          sold: true
        };
        return purchasedItem;
      })
    );
    setLoading(false);
    setPurchases(purchases);
  };
  useEffect(() => {
    loadPurchasedItems();
  }, []);
  if (loading)
    return (
      <main className="h-[100%]" style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );
  return (
    <div className="flex justify-center">
      {purchases.length > 0 ? (
        <div className="px-5 py-3 container">
          {/* <h2 className="text-white">Listed</h2> */}
          <div className="g-4 py-3 grid grid-cols-4 gap-4 h-[60vh]">
            {purchases.map((item, idx) => (
              <div key={idx} className="overflow-hidden rounded-lg h-100">
                <div
                  className="bg-[#485bb1] h-100 cursor-pointer"
                  onClick={() => detailsHandler(item)}
                >
                  <img
                    className="h-[60%] object-cover w-100"
                    variant="top"
                    src={item.image}
                  />
                  <div className="grid h-[40%] bg-[#131418] text-white p-2">
                    <div className="text-xl font-bold text-left">
                      {item.name}
                    </div>
                    <div className="text-left">#{item.itemId._hex}</div>
                    <div className="grid grid-cols-2">
                      <div className="text-left">
                        <span className="text-sm text-[#64748b]">Price:</span>
                        <div>
                          {ethers.utils.formatEther(item.totalPrice)} ETH
                        </div>
                      </div>
              
                    </div>
                    {/* <button className="text-white bg-blue-600 rounded-full items-center py-1 px-4 font-bold leading-normal transition duration-200 transform hover:scale-105 shadow">
                    Know More
                  </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <main className="h-[100%vh]" style={{ padding: "1rem 0" }}>
          <h2 className="h-[100vh]">No purchases</h2>
        </main>
      )}
    </div>
  );
}
