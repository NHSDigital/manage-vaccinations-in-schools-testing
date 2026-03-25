/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 28.65523148039515, "KoPercent": 71.34476851960486};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2699331440608114, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9298546895640687, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9699612403100775, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.18947368421052632, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.13593130779392337, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4351145038167939, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.43609022556390975, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.12915800415800416, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.1639784946236559, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.02100840336134454, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.8942307692307693, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.12956551843517397, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.1288115038115038, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.09580052493438321, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.421259842519685, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.13540290620871862, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.6308139534883721, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9312015503875969, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.056133056133056136, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.432, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.11566579634464752, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.07589285714285714, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.1076923076923077, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.01288659793814433, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.09507133592736705, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9215116279069767, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.135667107001321, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.2775423728813559, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.008620689655172414, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 42617, 30405, 71.34476851960486, 134.23873102283238, 0, 60015, 1.0, 2.0, 4.0, 5.0, 11.167277521140578, 132.69507289891632, 29.971525087838444], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 3785, 15, 0.3963011889035667, 134.65865257595811, -1, 1942, 4.0, 817.8000000000002, 1027.6999999999998, 1361.8399999999992, 1.443380033764034, 35.51124081060757, 12.706890926516511], "isController": true}, {"data": ["2.5 Select patient", 516, 14, 2.7131782945736433, 119.12209302325587, 2, 800, 96.0, 193.60000000000002, 256.0, 365.9399999999997, 0.3758330601988419, 9.179877413826068, 2.6513869257347316], "isController": false}, {"data": ["7.1 Full name search", 190, 146, 76.84210526315789, 126.1578947368421, 1, 1700, 2.0, 444.0, 657.6999999999997, 1267.7500000000016, 0.05729870963305906, 0.5132872951081076, 0.16862978438570958], "isController": false}, {"data": ["2.3 Search by first/last name", 3785, 3269, 86.3672391017173, 16.788110964332855, 0, 606, 1.0, 82.0, 101.69999999999982, 212.27999999999975, 1.4436844811356018, 5.804671030292009, 3.583797805718783], "isController": false}, {"data": ["4.0 Vaccination for flu", 131, 15, 11.450381679389313, 769.1068702290075, 6, 1711, 787.0, 1067.6, 1179.6, 1709.08, 0.09542346164268212, 4.605113894002017, 2.5368311343445793], "isController": true}, {"data": ["4.0 Vaccination for hpv", 133, 14, 10.526315789473685, 766.9323308270676, 7, 2145, 766.0, 1076.2000000000003, 1350.3999999999999, 1942.019999999998, 0.09841638418204515, 4.4062844607651614, 2.6173163593282083], "isController": true}, {"data": ["1.2 Sign-in page", 5772, 4755, 82.38045738045739, 153.57623007623073, 0, 8877, 1.0, 134.69999999999982, 898.0499999999984, 3305.0699999999806, 1.6065245157812087, 18.262385955320553, 4.266204103884549], "isController": false}, {"data": ["7.7 Due vaccination search", 186, 124, 66.66666666666667, 260.65053763440864, 1, 4289, 3.0, 806.0, 892.6000000000001, 1463.2399999999852, 0.05346319332204474, 2.348414780388436, 0.1987601102204092], "isController": false}, {"data": ["7.2 First name search", 238, 180, 75.63025210084034, 587.9117647058821, 1, 8267, 3.0, 1902.2999999999997, 2359.249999999986, 7188.939999999983, 0.06980892885531542, 2.3046344627212987, 0.2112264907249452], "isController": false}, {"data": ["2.4 Patient attending session", 416, 9, 2.1634615384615383, 403.0000000000001, 2, 1266, 361.0, 577.3, 672.4499999999999, 1051.1299999999999, 0.302761901781419, 8.941076005382394, 2.618491301417668], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 35.0, 35, 35, 35.0, 35.0, 35.0, 35.0, 28.57142857142857, 8.956473214285714, 16.85267857142857], "isController": false}, {"data": ["1.1 Homepage", 5777, 4753, 82.27453695689805, 156.34446944781038, 0, 8354, 1.0, 136.39999999999964, 926.3999999999978, 3324.5400000000272, 1.6052144879985417, 29.06036556722881, 4.256821375742727], "isController": false}, {"data": ["1.3 Sign-in", 5772, 4757, 82.41510741510741, 160.99705474705465, 0, 12421, 1.0, 216.0, 931.3999999999869, 3337.2999999999574, 1.6067870327943787, 18.477379947161424, 4.625406735801147], "isController": false}, {"data": ["Run some searches", 1905, 1423, 74.69816272965879, 509.81312335958165, 0, 60015, 3.0, 1568.2000000000003, 2090.7999999999993, 7258.440000000004, 0.533263313947369, 15.512591859329616, 1.6861803373184385], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 127, 17, 13.385826771653543, 787.9606299212599, 7, 1743, 792.0, 1171.0, 1295.6, 1709.3999999999999, 0.09550854162217122, 4.261726434865431, 2.5023262874946233], "isController": true}, {"data": ["2.1 Open session", 3785, 3266, 86.28797886393659, 35.17727873183622, 0, 926, 1.0, 190.4000000000001, 249.69999999999982, 385.5599999999995, 1.4432550988658341, 4.66731102152147, 3.1763181779552605], "isController": false}, {"data": ["4.3 Vaccination confirm", 516, 61, 11.821705426356589, 505.3158914728685, 2, 1759, 499.5, 772.8000000000001, 905.9999999999995, 1269.2799999999997, 0.3740583299020489, 6.953972617489474, 3.4739602664513174], "isController": false}, {"data": ["4.1 Vaccination questions", 516, 35, 6.782945736434108, 139.37596899224815, 2, 687, 120.0, 221.90000000000003, 298.29999999999995, 415.83, 0.3752339758366772, 4.9074250150166305, 3.3319236588385053], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 40.0, 40, 40, 40.0, 40.0, 40.0, 40.0, 25.0, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 5772, 4759, 82.44975744975746, 520.3553361053345, 0, 27826, 5.0, 974.6999999999998, 2725.149999999995, 10200.10999999991, 1.6065191500589642, 77.79815990915736, 15.521908465234949], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 125, 15, 12.0, 796.2399999999999, 8, 1716, 789.0, 1196.0, 1424.2999999999986, 1674.9199999999992, 0.09273581791136683, 4.521415221610784, 2.4651064097142625], "isController": true}, {"data": ["7.0 Open Children Search", 1915, 1423, 74.30809399477806, 435.96449086161886, 0, 11321, 1.0, 1454.4000000000005, 1766.5999999999922, 7139.5199999999995, 0.5337693425188115, 15.135230371468621, 1.557142272803797], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.8 Year group search", 224, 166, 74.10714285714286, 401.86160714285745, 1, 2610, 2.5, 1522.0, 1684.75, 2162.0, 0.06599324099582622, 2.32080623172849, 0.21945969203178753], "isController": false}, {"data": ["7.9 DOB search", 195, 143, 73.33333333333333, 349.69743589743604, 1, 4471, 3.0, 1226.4, 1529.8, 3594.5199999999927, 0.05464493124826958, 1.9691512242776499, 0.17994459827148274], "isController": false}, {"data": ["7.4 Partial name search", 194, 144, 74.22680412371135, 723.8453608247428, 1, 7843, 3.0, 2096.0, 3915.25, 7430.700000000005, 0.055567935811586894, 1.9021581684901445, 0.17126742933777914], "isController": false}, {"data": ["Debug Sampler", 3785, 0, 0.0, 0.3461030383091151, 0, 23, 0.0, 1.0, 1.0, 1.0, 1.4437907651557025, 6.625494073973202, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 3855, 3335, 86.51102464332037, 73.81945525291836, 0, 1265, 1.0, 423.0, 553.1999999999998, 749.8800000000001, 1.4555414217637992, 16.21436426408411, 3.2138320817517774], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 516, 38, 7.364341085271318, 135.06782945736447, 1, 957, 109.0, 237.3, 304.15, 586.4599999999974, 0.3752219699735163, 5.597009212526524, 3.1237684904532914], "isController": false}, {"data": ["7.5 Needs Consent search", 207, 169, 81.64251207729468, 1620.3140096618363, 1, 60015, 2.0, 7043.0, 7346.4, 8072.479999999995, 0.0590235116023971, 1.5095740363877097, 0.170439968597781], "isController": false}, {"data": ["2.2 Session register", 3785, 3267, 86.31439894319684, 21.586525759577235, 0, 988, 1.0, 82.0, 121.69999999999982, 328.1399999999999, 1.443761026081152, 8.927713980474897, 3.1879145955514234], "isController": false}, {"data": ["7.6 Needs triage search", 236, 170, 72.03389830508475, 60.42796610169494, 1, 673, 3.0, 188.3, 243.29999999999995, 456.3299999999996, 0.06813784748497718, 1.155416173016142, 0.23258203943001535], "isController": false}, {"data": ["7.3 Last name search", 232, 181, 78.01724137931035, 476.3750000000003, 1, 7753, 3.0, 1838.9, 2244.3499999999995, 5126.749999999988, 0.0694875621756436, 2.0503551718589152, 0.1990390676970594], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["464", 30397, 99.9736885380694, 71.32599666799634], "isController": false}, {"data": ["504/Gateway Time-out", 1, 0.00328893274132544, 0.0023464814510641293], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, 0.00657786548265088, 0.0046929629021282586], "isController": false}, {"data": ["Assertion failed", 5, 0.0164446637066272, 0.011732407255320647], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 42617, 30405, "464", 30397, "Assertion failed", 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "504/Gateway Time-out", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["2.5 Select patient", 516, 14, "464", 14, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.1 Full name search", 190, 146, "464", 146, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.3 Search by first/last name", 3785, 3269, "464", 3269, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.2 Sign-in page", 5772, 4755, "464", 4754, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["7.7 Due vaccination search", 186, 124, "464", 124, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.2 First name search", 238, 180, "464", 179, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["2.4 Patient attending session", 416, 9, "464", 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 5777, 4753, "464", 4752, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["1.3 Sign-in", 5772, 4757, "464", 4757, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 3785, 3266, "464", 3266, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.3 Vaccination confirm", 516, 61, "464", 61, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 516, 35, "464", 35, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.0 Open Children Search", 1915, 1423, "464", 1422, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["7.8 Year group search", 224, 166, "464", 166, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.9 DOB search", 195, 143, "464", 143, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.4 Partial name search", 194, 144, "464", 144, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Open Sessions list", 3855, 3335, "464", 3335, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 516, 38, "464", 38, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.5 Needs Consent search", 207, 169, "464", 167, "504/Gateway Time-out", 1, "Assertion failed", 1, "", "", "", ""], "isController": false}, {"data": ["2.2 Session register", 3785, 3267, "464", 3267, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.6 Needs triage search", 236, 170, "464", 170, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.3 Last name search", 232, 181, "464", 181, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
