const viewTemplate = "land-summary";
const axios = require("axios");
const { LAND_SUMMARY_URL } = require("../constants/endpoints");
const endpoint = "https://loripsum.net/api/1/plaintext";

const fakeResponse = {
  SBI: "21",
  LandParcels: [
    {
      ParcelId: "XXX",
      Country: "England",
      LandCover: 100,
      LandType: "ariable",
    },
    {
      ParcelId: "XXX1",
      Country: "Wales",
      LandCover: 12.3,
      LandType: "ariable",
    },
    {
      ParcelId: "XXX4",
      Country: "Wales",
      LandCover: 23.45,
      LandType: "grassland",
    },
  ],
};

module.exports = {
  method: "GET",
  path: `/${LAND_SUMMARY_URL}`,
  handler: async (request, h) => {
    return await axios
      .get(endpoint)
      .then(function (response) {
        const { LandParcels } = fakeResponse;

        const totalParcels = LandParcels.length;
        let totalLand = 0;
        const totals = {};

        LandParcels.forEach(({ LandCover, LandType }) => {
          totalLand += LandCover;
          if (typeof totals[LandType] === "undefined") {
            totals[LandType] = {
              parcels: 0,
              hectares: 0,
            };
          }
          totals[LandType].parcels++;
          totals[LandType].hectares += LandCover;
        });

        return h.view(viewTemplate, { totalLand, totalParcels, totals });
      })
      .catch(function (error) {
        console.log(error);
      });
  },
};
