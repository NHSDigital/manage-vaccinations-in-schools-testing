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

    var data = {"OkPercent": 99.97131382673551, "KoPercent": 0.02868617326448652};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7721583652618136, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "1.4 Select Organisations-0"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations-1"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "1.3 Sign-in-1"], "isController": false}, {"data": [0.8214285714285714, 500, 1500, "1.3 Sign-in-0"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.7572463768115942, 500, 1500, "2.4 Patient attending session-1"], "isController": false}, {"data": [1.0, 500, 1500, "2.4 Patient attending session-0"], "isController": false}, {"data": [0.7357142857142858, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4744525547445255, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-2"], "isController": false}, {"data": [0.5, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.9963503649635036, 500, 1500, "4.2 Vaccination batch-0"], "isController": false}, {"data": [0.9963503649635036, 500, 1500, "4.2 Vaccination batch-1"], "isController": false}, {"data": [1.0, 500, 1500, "6.1 Logout"], "isController": false}, {"data": [0.9642857142857143, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6428571428571429, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9854014598540146, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.4927007299270073, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.7572463768115942, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.49635036496350365, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.42857142857142855, 500, 1500, "1.0 Login"], "isController": true}, {"data": [1.0, 500, 1500, "6.1 Logout-0"], "isController": false}, {"data": [1.0, 500, 1500, "6.1 Logout-1"], "isController": false}, {"data": [1.0, 500, 1500, "6.1 Logout-2"], "isController": false}, {"data": [0.9233576642335767, 500, 1500, "3.2 Nurse triage result-1"], "isController": false}, {"data": [0.9562043795620438, 500, 1500, "3.2 Nurse triage result-0"], "isController": false}, {"data": [0.31521739130434784, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.9021739130434783, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.9934640522875817, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8941605839416058, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9343065693430657, 500, 1500, "4.3 Vaccination confirm-0"], "isController": false}, {"data": [0.9963503649635036, 500, 1500, "4.3 Vaccination confirm-1"], "isController": false}, {"data": [0.9817518248175182, 500, 1500, "4.3 Vaccination confirm-2"], "isController": false}, {"data": [0.5928571428571429, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9963503649635036, 500, 1500, "4.1 Vaccination questions-0"], "isController": false}, {"data": [1.0, 500, 1500, "4.1 Vaccination questions-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3486, 1, 0.02868617326448652, 466.310384394722, 0, 10764, 300.0, 785.0, 1105.2999999999993, 3298.380000000003, 0.8393537987019632, 19.10906491305188, 0.806692808563648], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.4 Select Organisations-0", 14, 0, 0.0, 126.78571428571429, 115, 150, 126.0, 142.0, 150.0, 150.0, 0.006594973028915659, 0.004785219687972983, 0.005268249939114266], "isController": false}, {"data": ["1.4 Select Organisations-1", 14, 0, 0.0, 142.85714285714286, 124, 252, 134.5, 200.5, 252.0, 252.0, 0.006594973028915659, 0.0899659943759012, 0.004434217705476983], "isController": false}, {"data": ["2.0 Register attendance", 140, 0, 0.0, 5338.16428571429, 3229, 14397, 5018.0, 6087.4, 7017.399999999993, 14387.16, 0.03566439195778152, 7.1583775859709275, 0.15486719878045613], "isController": true}, {"data": ["1.3 Sign-in-1", 14, 0, 0.0, 128.1428571428571, 119, 148, 126.0, 144.0, 148.0, 148.0, 0.0066006009375682165, 0.059366733041995384, 0.004528244295548508], "isController": false}, {"data": ["1.3 Sign-in-0", 14, 0, 0.0, 463.99999999999994, 331, 731, 398.5, 705.0, 731.0, 731.0, 0.006599661248816185, 0.00468550168739196, 0.006026057878557748], "isController": false}, {"data": ["1.4 Select Organisations", 14, 0, 0.0, 270.0714285714286, 242, 386, 262.0, 336.0, 386.0, 386.0, 0.006594556758643462, 0.09474523343082286, 0.009701855231344116], "isController": false}, {"data": ["2.4 Patient attending session-1", 138, 0, 0.0, 534.6666666666664, 400, 1060, 497.0, 672.9000000000001, 800.4499999999998, 1020.6099999999985, 0.035202878268957134, 1.7872861915402636, 0.02351442259371746], "isController": false}, {"data": ["2.4 Patient attending session-0", 138, 0, 0.0, 247.39130434782604, 170, 497, 230.0, 359.50000000000006, 436.7499999999998, 490.75999999999976, 0.03520444086164145, 0.026162675288778456, 0.028809884220757354], "isController": false}, {"data": ["2.3 Search by first/last name", 140, 0, 0.0, 566.5571428571427, 404, 2240, 504.5, 737.0, 789.0999999999998, 1956.6900000000023, 0.035716399542013715, 1.9889858994843572, 0.030807138569808212], "isController": false}, {"data": ["1.2 Sign-in page", 14, 0, 0.0, 121.99999999999999, 108, 167, 118.0, 148.5, 167.0, 167.0, 0.0066179991614049635, 0.03988249299319339, 0.00415886959019931], "isController": false}, {"data": ["3.0 Nurse triage", 137, 0, 0.0, 1235.3576642335768, 891, 2421, 1252.0, 1417.0, 1516.2999999999995, 2316.1200000000013, 0.03510468498926232, 3.967896897700336, 0.10546669708859167], "isController": true}, {"data": ["4.2 Vaccination batch-2", 137, 0, 0.0, 0.3868613138686132, 0, 4, 0.0, 1.0, 1.0, 3.6200000000000045, 0.03513720565857767, 0.17562917278361814, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 138, 0, 0.0, 782.1956521739131, 581, 1297, 738.0, 1070.8000000000002, 1161.3499999999995, 1276.7199999999993, 0.03520000489739198, 1.8132996861619852, 0.05231875727913145], "isController": false}, {"data": ["4.2 Vaccination batch-0", 137, 0, 0.0, 184.05839416058396, 118, 700, 137.0, 353.0, 363.0, 591.3200000000013, 0.03513611525876851, 0.026283461218961603, 0.03156760355279983], "isController": false}, {"data": ["4.2 Vaccination batch-1", 137, 0, 0.0, 173.1970802919709, 138, 742, 161.0, 188.0, 215.79999999999995, 643.5800000000012, 0.03513588997798749, 0.4772605853761092, 0.02522962674592674], "isController": false}, {"data": ["6.1 Logout", 14, 0, 0.0, 357.9285714285714, 338, 409, 357.5, 388.0, 409.0, 409.0, 0.005913882882308239, 0.037088824091976086, 0.012503473086130212], "isController": false}, {"data": ["1.1 Homepage", 14, 0, 0.0, 258.5, 107, 546, 232.5, 515.5, 546.0, 546.0, 0.006616088247275353, 0.034146510143408436, 0.003931532908659231], "isController": false}, {"data": ["1.3 Sign-in", 14, 0, 0.0, 592.6428571428569, 463, 851, 531.0, 829.0, 851.0, 851.0, 0.006599275493826142, 0.06404003963100623, 0.01055304064564483], "isController": false}, {"data": ["2.1 Open session", 140, 0, 0.0, 3038.8214285714284, 2143, 10764, 2744.0, 3810.0000000000005, 4849.049999999994, 9934.980000000007, 0.035705486862166104, 0.6076826794723545, 0.02344392977712635], "isController": false}, {"data": ["3.3 Nurse triage complete", 137, 0, 0.0, 233.94160583941613, 168, 1372, 209.0, 272.2, 333.89999999999964, 1083.5800000000036, 0.035193864245191796, 0.8147898369175415, 0.02378335357194602], "isController": false}, {"data": ["4.3 Vaccination confirm", 137, 0, 0.0, 748.0583941605837, 499, 2059, 653.0, 1016.0000000000001, 1338.8999999999994, 2008.8400000000006, 0.03514127047235511, 0.8497222224448833, 0.08174663897474702], "isController": false}, {"data": ["4.1 Vaccination questions", 138, 1, 0.7246376811594203, 425.73913043478274, 265, 701, 409.5, 558.9000000000001, 593.2499999999999, 684.6199999999994, 0.03480929801753481, 0.4032035144369041, 0.07086354474558691], "isController": false}, {"data": ["3.1 Nurse triage new", 137, 0, 0.0, 200.10948905109487, 133, 484, 155.0, 385.40000000000003, 436.59999999999997, 483.24, 0.03514933979533848, 0.39585425603664254, 0.024165171109295204], "isController": false}, {"data": ["3.2 Nurse triage result", 137, 0, 0.0, 801.3065693430653, 538, 1763, 859.0, 976.8, 1031.3, 1576.8000000000022, 0.035195401271247616, 2.7669521712961465, 0.05775800974758474], "isController": false}, {"data": ["1.0 Login", 14, 0, 0.0, 1410.0714285714284, 1134, 1807, 1385.0, 1786.0, 1807.0, 1807.0, 0.006612791311170091, 0.31104658817755726, 0.03251181431258381], "isController": true}, {"data": ["6.1 Logout-0", 14, 0, 0.0, 126.57142857142857, 117, 151, 125.0, 143.5, 151.0, 151.0, 0.005914527473613814, 0.004262618433131831, 0.0046265004944967434], "isController": false}, {"data": ["6.1 Logout-1", 14, 0, 0.0, 113.14285714285715, 103, 126, 112.0, 122.5, 126.0, 126.0, 0.0059145249749266385, 0.0023045854150348915, 0.0037716648521748976], "isController": false}, {"data": ["6.1 Logout-2", 14, 0, 0.0, 118.14285714285714, 112, 132, 118.5, 127.5, 132.0, 132.0, 0.00591448749487235, 0.030525455478906616, 0.00410664121958422], "isController": false}, {"data": ["3.2 Nurse triage result-1", 137, 0, 0.0, 444.2335766423357, 239, 1250, 449.0, 522.8, 592.3999999999999, 1104.4600000000019, 0.0351992715549291, 2.7411663558040003, 0.025034518409732878], "isController": false}, {"data": ["3.2 Nurse triage result-0", 137, 0, 0.0, 356.9051094890511, 184, 683, 397.0, 499.2, 518.2, 650.7000000000004, 0.03519969661458568, 0.026090400127412622, 0.03273023797178834], "isController": false}, {"data": ["4.0 Vaccination", 138, 1, 0.7246376811594203, 1524.0217391304348, 338, 2882, 1469.5, 1717.2000000000003, 2138.85, 2755.249999999995, 0.03484799204859729, 1.9088967152547842, 0.20734274141262143], "isController": true}, {"data": ["2.5 Patient return to consent page", 138, 0, 0.0, 324.1014492753623, 168, 5132, 223.5, 554.1, 602.0999999999999, 3394.939999999934, 0.03520792576332314, 0.794851463134878, 0.02441174540230413], "isController": false}, {"data": ["1.5 Open Sessions list", 153, 0, 0.0, 209.01307189542484, 134, 1452, 162.0, 370.6, 385.4999999999999, 1017.8400000000064, 0.03720168443391558, 0.43817335542720304, 0.02407120326416819], "isController": false}, {"data": ["4.2 Vaccination batch", 137, 0, 0.0, 358.21897810218996, 267, 880, 300.0, 527.4, 581.0, 872.7800000000001, 0.03513456538542618, 0.6791408705973441, 0.056794886699361474], "isController": false}, {"data": ["4.3 Vaccination confirm-0", 137, 0, 0.0, 338.4160583941605, 188, 1330, 283.0, 530.2, 605.0999999999999, 1127.8400000000024, 0.03514451578809653, 0.026495670105869645, 0.033705045642977896], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 137, 0, 0.0, 146.0218978102191, 120, 699, 138.0, 155.8, 173.79999999999995, 528.000000000002, 0.035145895228803625, 0.026256454931674587, 0.023716614846780573], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 137, 0, 0.0, 263.30656934306575, 168, 978, 240.0, 365.0, 473.6999999999998, 884.1400000000011, 0.035145489499707805, 0.7970716832662833, 0.02433413286649691], "isController": false}, {"data": ["2.2 Session register", 140, 0, 0.0, 640.0071428571429, 403, 1374, 600.5, 916.4000000000001, 1055.0499999999995, 1317.4200000000005, 0.035730054335204056, 1.9582719123331216, 0.02377409425907352], "isController": false}, {"data": ["4.1 Vaccination questions-0", 137, 0, 0.0, 263.6715328467153, 133, 555, 185.0, 392.6, 422.1, 521.9400000000004, 0.03514253246836531, 0.02621962383381943, 0.04657172130753307], "isController": false}, {"data": ["4.1 Vaccination questions-1", 137, 0, 0.0, 162.54014598540138, 132, 414, 155.0, 188.2, 213.29999999999998, 387.7800000000003, 0.03514278487844444, 0.3826677724886889, 0.025165939436540594], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 1, 100.0, 0.02868617326448652], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3486, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 138, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
