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

    var data = {"OkPercent": 99.99592734381363, "KoPercent": 0.0040726561863647474};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6579099829814969, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "1.4 Select Organisations-0"], "isController": false}, {"data": [0.9642857142857143, 500, 1500, "1.4 Select Organisations-1"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "1.3 Sign-in-1"], "isController": false}, {"data": [0.8571428571428571, 500, 1500, "1.3 Sign-in-0"], "isController": false}, {"data": [0.9571428571428572, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.5997993981945837, 500, 1500, "2.4 Patient attending session-1"], "isController": false}, {"data": [0.8329989969909729, 500, 1500, "2.4 Patient attending session-0"], "isController": false}, {"data": [0.839, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9785714285714285, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.21184738955823293, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-2"], "isController": false}, {"data": [0.3721163490471414, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.9417670682730924, 500, 1500, "4.2 Vaccination batch-0"], "isController": false}, {"data": [0.9046184738955824, 500, 1500, "4.2 Vaccination batch-1"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5928571428571429, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.031, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.8519076305220884, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.3684738955823293, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5541624874623872, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.893574297188755, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.3930722891566265, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.24285714285714285, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.7259036144578314, 500, 1500, "3.2 Nurse triage result-1"], "isController": false}, {"data": [0.7740963855421686, 500, 1500, "3.2 Nurse triage result-0"], "isController": false}, {"data": [0.04864593781344032, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.7617853560682046, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.9209541627689429, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.7816265060240963, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.7931726907630522, 500, 1500, "4.3 Vaccination confirm-0"], "isController": false}, {"data": [0.9186746987951807, 500, 1500, "4.3 Vaccination confirm-1"], "isController": false}, {"data": [0.8493975903614458, 500, 1500, "4.3 Vaccination confirm-2"], "isController": false}, {"data": [0.497, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.8830321285140562, 500, 1500, "4.1 Vaccination questions-0"], "isController": false}, {"data": [0.8845381526104418, 500, 1500, "4.1 Vaccination questions-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 24554, 1, 0.0040726561863647474, 1063.67842306753, 0, 24851, 387.0, 3328.9000000000015, 5810.950000000001, 11883.88000000002, 6.857214988798449, 203.21815780847066, 6.5831717984536215], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.4 Select Organisations-0", 70, 0, 0.0, 140.54285714285717, 113, 331, 130.0, 162.8, 194.2500000000001, 331.0, 0.0780495637029389, 0.05663166585086289, 0.06234818662988674], "isController": false}, {"data": ["1.4 Select Organisations-1", 70, 0, 0.0, 236.47142857142856, 120, 3474, 146.5, 208.1, 729.9500000000028, 3474.0, 0.07775954748386768, 1.0606888273971324, 0.05027033245539101], "isController": false}, {"data": ["2.0 Register attendance", 1000, 0, 0.0, 9574.043000000005, 2943, 41230, 6916.5, 19811.499999999996, 24882.35, 34174.39000000001, 0.30052149495018704, 90.57878184842282, 1.3095987185312674], "isController": true}, {"data": ["1.3 Sign-in-1", 70, 0, 0.0, 144.01428571428573, 115, 279, 137.0, 175.0, 193.70000000000002, 279.0, 0.07811357937622959, 0.7025645176319087, 0.05156716763508907], "isController": false}, {"data": ["1.3 Sign-in-0", 70, 0, 0.0, 540.2285714285713, 339, 3266, 401.5, 842.5, 1360.9000000000017, 3266.0, 0.0780886573994023, 0.055439896415395956, 0.07130165494964955], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 377.21428571428567, 245, 3625, 284.5, 388.29999999999995, 943.8000000000025, 3625.0, 0.07774840615767377, 1.1169500029155652, 0.11237074327476286], "isController": false}, {"data": ["2.4 Patient attending session-1", 997, 0, 0.0, 1535.3951855566709, 268, 20909, 636.0, 3834.0000000000055, 7408.699999999999, 14159.51999999999, 0.30032354816758955, 32.993365830323064, 0.2006067450650696], "isController": false}, {"data": ["2.4 Patient attending session-0", 997, 0, 0.0, 826.1825476429287, 168, 19699, 298.0, 1518.000000000003, 4014.699999999984, 9779.299999999994, 0.30033684720415615, 0.22320072820765474, 0.24578347456746372], "isController": false}, {"data": ["2.3 Search by first/last name", 1000, 0, 0.0, 741.861, 250, 21675, 352.5, 1019.6999999999999, 2979.0999999999976, 7708.450000000002, 0.30085919368532654, 12.574975580105416, 0.2595677383910472], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 170.68571428571423, 107, 2266, 119.0, 150.8, 161.9, 2266.0, 0.0790141740140442, 0.47616842562565115, 0.04760912633463406], "isController": false}, {"data": ["3.0 Nurse triage", 996, 0, 0.0, 3301.3905622489965, 756, 24925, 1631.0, 7791.500000000004, 11275.899999999998, 16447.84, 0.30059240243648855, 33.87508210599609, 0.9027904758911917], "isController": true}, {"data": ["4.2 Vaccination batch-2", 996, 0, 0.0, 0.36947791164658617, 0, 14, 0.0, 1.0, 1.0, 1.0, 0.29955508851161117, 1.4954651267575176, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 997, 0, 0.0, 2361.719157472417, 446, 24706, 1034.0, 6775.2, 9314.499999999989, 17363.5, 0.3002850147537226, 33.212294780454606, 0.44632206294449783], "isController": false}, {"data": ["4.2 Vaccination batch-0", 996, 0, 0.0, 374.713855421687, 119, 9652, 152.0, 388.2000000000003, 1307.6499999999992, 5102.429999999998, 0.2995387824530422, 0.22406905015530304, 0.26911687486015506], "isController": false}, {"data": ["4.2 Vaccination batch-1", 996, 0, 0.0, 499.4407630522096, 134, 16355, 185.0, 670.3000000000008, 2404.2499999999977, 6614.649999999988, 0.2995376113679937, 4.0749184711101085, 0.2147880953723544], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 362.4285714285715, 316, 570, 357.0, 391.0, 429.00000000000006, 570.0, 0.0789227718128448, 0.4073309072567234, 0.042775525738407094], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 684.5285714285714, 463, 3401, 542.5, 988.0, 1485.2000000000016, 3401.0, 0.07807672488215991, 0.7576644679238507, 0.12283359744644495], "isController": false}, {"data": ["2.1 Open session", 1000, 0, 0.0, 4027.3260000000005, 1130, 24103, 3003.0, 7346.499999999999, 10522.14999999998, 16453.710000000003, 0.30078326971265873, 5.164476058196901, 0.19718046984903387], "isController": false}, {"data": ["3.3 Nurse triage complete", 996, 0, 0.0, 713.4578313253024, 165, 15638, 265.0, 1210.6000000000008, 3751.449999999999, 8075.979999999998, 0.3004516729818833, 6.973823037226294, 0.20303960713228833], "isController": false}, {"data": ["4.3 Vaccination confirm", 996, 0, 0.0, 1958.7650602409628, 490, 23766, 941.0, 5337.400000000001, 7198.449999999999, 13086.679999999986, 0.2994242396548324, 7.2655577817383685, 0.6964664463723972], "isController": false}, {"data": ["4.1 Vaccination questions", 997, 1, 0.10030090270812438, 1285.0822467402209, 272, 18036, 560.0, 3756.000000000003, 5640.299999999997, 10949.779999999999, 0.2958234886223675, 3.439577992178925, 0.6033092137296517], "isController": false}, {"data": ["3.1 Nurse triage new", 996, 0, 0.0, 590.3323293172698, 131, 11573, 201.5, 814.4000000000019, 3394.499999999998, 6312.539999999999, 0.3007823057862845, 3.3872980109788564, 0.20678783522807062], "isController": false}, {"data": ["3.2 Nurse triage result", 996, 0, 0.0, 1997.6004016064278, 423, 20681, 970.5, 5582.900000000009, 8243.75, 14692.929999999991, 0.30079175274917924, 23.528426698695753, 0.49332544214273655], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1805.985714285714, 1318, 6181, 1518.0, 2640.5999999999995, 3968.050000000002, 6181.0, 0.07840097844421098, 3.6205326842478995, 0.3732468456206333], "isController": true}, {"data": ["3.2 Nurse triage result-1", 996, 0, 0.0, 1025.4467871485936, 207, 17643, 473.0, 1643.3000000000002, 5406.65, 11233.799999999996, 0.30083772432572026, 23.309035804805095, 0.2136638536753701], "isController": false}, {"data": ["3.2 Nurse triage result-0", 996, 0, 0.0, 972.027108433735, 185, 19568, 419.0, 1729.4000000000046, 4748.649999999997, 12794.589999999993, 0.300825821245431, 0.22297804358485915, 0.27972591777548367], "isController": false}, {"data": ["4.0 Vaccination", 997, 1, 0.10030090270812438, 4115.84954864593, 357, 30154, 2161.0, 9139.600000000004, 13627.099999999997, 21247.239999999983, 0.2959375521304239, 16.33363635456287, 1.7688162399590495], "isController": true}, {"data": ["2.5 Patient return to consent page", 997, 0, 0.0, 841.7572718154474, 169, 17830, 345.0, 1249.8000000000009, 4064.0999999999935, 11042.939999999999, 0.3003151350996402, 6.8066304412162495, 0.20822631437572706], "isController": false}, {"data": ["1.5 Open Sessions list", 1069, 0, 0.0, 486.4424695977548, 127, 10171, 197.0, 498.0, 2039.0, 5701.999999999989, 0.3023892997750043, 3.302658133480125, 0.1953510080503726], "isController": false}, {"data": ["4.2 Vaccination batch", 996, 0, 0.0, 874.842369477912, 262, 19041, 360.0, 1817.6000000000029, 4039.6999999999953, 8294.039999999983, 0.29952572086909374, 5.794134506934351, 0.4838847089488121], "isController": false}, {"data": ["4.3 Vaccination confirm-0", 996, 0, 0.0, 822.0130522088361, 194, 17919, 397.0, 1404.7000000000007, 3995.5499999999984, 8776.599999999999, 0.29945700867703745, 0.22576309767379632, 0.2871287886873801], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 996, 0, 0.0, 445.89859437750994, 118, 10645, 148.0, 483.90000000000293, 2302.849999999992, 5952.439999999999, 0.2994962689259992, 0.22374477121913025, 0.20210148616002482], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 996, 0, 0.0, 690.6716867469883, 166, 18399, 300.0, 1127.900000000001, 2599.3999999999996, 7882.149999999989, 0.29949545840395986, 6.817749660549262, 0.20736550782071048], "isController": false}, {"data": ["2.2 Session register", 1000, 0, 0.0, 1610.3819999999998, 308, 24851, 756.5, 3738.4999999999995, 7777.149999999998, 13598.45, 0.30085747388632345, 32.95528689834522, 0.19987337002942085], "isController": false}, {"data": ["4.1 Vaccination questions-0", 996, 0, 0.0, 672.5903614457826, 137, 11146, 369.0, 731.3000000000001, 3450.0999999999985, 6823.309999999998, 0.2997170743039553, 0.22361703590646662, 0.39714722232085736], "isController": false}, {"data": ["4.1 Vaccination questions-1", 996, 0, 0.0, 613.3062248995974, 127, 12868, 174.0, 1174.1000000000054, 4041.499999999999, 7118.149999999997, 0.29971968986836106, 3.2634103567108173, 0.2143332675690356], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 1, 100.0, 0.0040726561863647474], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 24554, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 997, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
