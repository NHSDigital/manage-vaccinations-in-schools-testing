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

    var data = {"OkPercent": 99.87237921604375, "KoPercent": 0.1276207839562443};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4837188523776432, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Prevent multiple runs"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Completed sessions list"], "isController": false}, {"data": [0.9642857142857143, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "Scheduled sessions list"], "isController": false}, {"data": [0.2719298245614035, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.03470715835140998, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.10118343195266272, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.5, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7571428571428571, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Get school name"], "isController": false}, {"data": [0.0034802784222737818, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.7574221578566256, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.3182827535159141, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.5587175792507204, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.8588912886969042, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.38756326825741144, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.07142857142857142, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [0.6497418244406197, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.0032514450867052024, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.7130952380952381, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.5, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8748524203069658, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.6966250917094644, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.5, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.27906976744186046, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "5.1 Consent homepage"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 16455, 21, 0.1276207839562443, 1221.6532360984502, 0, 19125, 638.0, 2905.0, 4539.0, 8036.280000000006, 4.568593453487387, 164.71216737661953, 4.845100683276116], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Prevent multiple runs", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 0.0, 0.0], "isController": false}, {"data": ["2.0 Register attendance", 852, 0, 0.0, 11068.076291079817, 5278, 33998, 9637.0, 17726.5, 21560.649999999994, 27397.300000000025, 0.24256966689092024, 88.1936407920469, 1.0538115725162305], "isController": true}, {"data": ["Completed sessions list", 1, 0, 0.0, 310.0, 310, 310, 310.0, 310.0, 310.0, 310.0, 3.225806451612903, 48.95728326612903, 1.9594254032258065], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 412.9285714285715, 361, 881, 395.0, 468.9, 526.3000000000001, 881.0, 0.07860055087757516, 1.1308807774212057, 0.11360235869024535], "isController": false}, {"data": ["Scheduled sessions list", 1, 0, 0.0, 465.0, 465, 465, 465.0, 465.0, 465.0, 465.0, 2.150537634408602, 24.899193548387096, 1.3062836021505375], "isController": false}, {"data": ["2.3 Search by first/last name", 855, 0, 0.0, 1907.6561403508765, 930, 15662, 1449.0, 3031.5999999999995, 4881.799999999993, 8554.44, 0.24307754941439633, 29.016589805089474, 0.20969825316086105], "isController": false}, {"data": ["5.8 Consent confirm", 2, 0, 0.0, 922.0, 895, 949, 922.0, 949.0, 949.0, 949.0, 0.0033713907155271086, 0.28290215265404306, 0.007325531584031071], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 109.27142857142857, 85, 1095, 91.0, 116.69999999999999, 125.40000000000003, 1095.0, 0.07889404079498144, 0.4770624029321534, 0.047536741377444874], "isController": false}, {"data": ["3.0 Nurse triage", 1383, 0, 0.0, 2936.8279103398377, 1197, 18045, 2053.0, 5903.600000000002, 7381.0, 10965.320000000023, 0.3998553234968345, 47.59085688103162, 1.2027900728290357], "isController": true}, {"data": ["2.4 Patient attending session", 845, 0, 0.0, 2585.078106508876, 1162, 19125, 1857.0, 4664.399999999999, 6528.199999999999, 13825.439999999999, 0.24108010735339977, 24.53253829411288, 0.3583241439373773], "isController": false}, {"data": ["5.4 Consent route", 2, 0, 0.0, 556.5, 504, 609, 556.5, 609.0, 609.0, 609.0, 0.003381217001435327, 0.03853233574047807, 0.0052600377766469485], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 281.77142857142854, 248, 562, 264.5, 339.7, 350.6, 562.0, 0.07890408982441585, 0.4088526373128423, 0.04276540024663164], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 623.3285714285714, 423, 4255, 494.0, 850.5999999999999, 1214.5000000000002, 4255.0, 0.07861688196461342, 0.7645184673863481, 0.12368339535643771], "isController": false}, {"data": ["Get school name", 1, 0, 0.0, 4481.0, 4481, 4481, 4481.0, 4481.0, 4481.0, 4481.0, 0.2231644722160232, 2218.134554228967, 0.13969572918991296], "isController": false}, {"data": ["2.1 Open session", 862, 0, 0.0, 3783.9002320185596, 1379, 15136, 3226.0, 5934.4000000000015, 7124.999999999998, 12112.730000000001, 0.24330508792712816, 4.030693961344833, 0.15935914336004325], "isController": false}, {"data": ["3.3 Nurse triage complete", 1381, 0, 0.0, 792.3222302679224, 311, 11911, 449.0, 1231.0, 3110.899999999997, 5865.040000000008, 0.39998459146975657, 9.331399387348004, 0.27095036961646374], "isController": false}, {"data": ["4.3 Vaccination confirm", 1351, 0, 0.0, 2084.293856402666, 801, 17311, 1284.0, 4633.999999999996, 6343.799999999999, 11946.920000000002, 0.4009115024210485, 10.086417029828885, 0.9331918381198883], "isController": false}, {"data": ["5.6 Consent questions", 2, 0, 0.0, 594.0, 536, 652, 594.0, 652.0, 652.0, 652.0, 0.003372903108298859, 0.04057529974568311, 0.006541587473712436], "isController": false}, {"data": ["4.1 Vaccination questions", 1388, 21, 1.5129682997118155, 1016.2146974063392, 90, 12930, 615.0, 2115.500000000001, 3859.299999999997, 6497.529999999988, 0.4064453803880733, 4.678277802727138, 0.8634424964706895], "isController": false}, {"data": ["5.3 Consent parent details", 3, 0, 0.0, 494.0, 434, 583, 465.0, 583.0, 583.0, 583.0, 0.0016940653502649518, 0.019186172417453844, 0.0028157219005380354], "isController": false}, {"data": ["3.1 Nurse triage new", 1389, 0, 0.0, 588.5471562275025, 275, 13481, 362.0, 705.0, 1901.0, 4376.2, 0.3991483685349243, 4.48885913081707, 0.27505882696932593], "isController": false}, {"data": ["3.2 Nurse triage result", 1383, 0, 0.0, 1556.469269703543, 574, 11118, 1025.0, 3172.2000000000007, 4965.6, 8106.800000000007, 0.40020151868229237, 33.808394642826656, 0.6573399355792751], "isController": false}, {"data": ["5.2 Consent who", 3, 0, 0.0, 2245.6666666666665, 523, 5218, 996.0, 5218.0, 5218.0, 5218.0, 0.0016963653111388434, 0.02541621294784751, 0.0026406311581594886], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1881.957142857143, 1428, 7403, 1603.0, 2376.4, 3797.200000000006, 7403.0, 0.0784476334030023, 14.792404447980813, 0.37553192923743295], "isController": true}, {"data": ["5.0 Consent", 2, 0, 0.0, 9858.5, 5998, 13719, 9858.5, 13719.0, 13719.0, 13719.0, 0.003348305840952124, 0.68433289505405, 0.05007744526775565], "isController": true}, {"data": ["5.9 Patient return to menacwy vaccination page", 581, 0, 0.0, 880.3373493975903, 310, 13383, 580.0, 1318.6000000000004, 3259.099999999999, 7385.859999999976, 0.17278399324328345, 4.907937076497065, 0.1205071236223376], "isController": false}, {"data": ["4.0 Vaccination", 1384, 21, 1.5173410404624277, 3925.683526011564, 91, 22358, 2657.0, 7722.5, 9826.25, 16126.90000000003, 0.40343055893205165, 21.427707481071703, 2.415936496342599], "isController": true}, {"data": ["2.5 Patient return to consent page", 840, 0, 0.0, 785.4761904761905, 308, 15049, 502.5, 1159.2999999999993, 2577.7999999999984, 5567.000000000004, 0.24062645378482495, 5.28289398311762, 0.16684060760471262], "isController": false}, {"data": ["5.5 Consent agree", 2, 0, 0.0, 656.5, 562, 751, 656.5, 751.0, 751.0, 751.0, 0.003355783525116362, 0.05833459437386113, 0.005158206316926908], "isController": false}, {"data": ["Debug Sampler", 2206, 0, 0.0, 0.23390752493200398, 0, 9, 0.0, 1.0, 1.0, 1.0, 0.6274050289101184, 2.4643955622861604, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 847, 0, 0.0, 582.4273907910272, 269, 10186, 361.0, 659.8000000000006, 1686.3999999999933, 4662.959999999994, 0.23856446718865434, 2.5880983066394156, 0.15390665906447804], "isController": false}, {"data": ["4.2 Vaccination batch", 1363, 0, 0.0, 887.2721936903891, 385, 13393, 506.0, 1366.800000000001, 3610.3999999999996, 6540.5199999999995, 0.3999120956244687, 6.921527178893767, 0.64645089751365], "isController": false}, {"data": ["5.7 Consent triage", 2, 0, 0.0, 793.0, 788, 798, 793.0, 798.0, 798.0, 798.0, 0.003370856585221154, 0.055033183976296134, 0.00557310566287052], "isController": false}, {"data": ["2.2 Session register", 860, 0, 0.0, 2017.8476744186057, 664, 16306, 1440.0, 3323.199999999999, 5683.049999999992, 11836.999999999998, 0.24339618049128672, 24.6388181327112, 0.16155565200600908], "isController": false}, {"data": ["5.1 Consent homepage", 3, 0, 0.0, 1385.6666666666667, 667, 2746, 744.0, 2746.0, 2746.0, 2746.0, 0.0016993681749125674, 0.021398652054082958, 0.003619455067855771], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 60.0, 60, 60, 60.0, 60.0, 60.0, 60.0, 16.666666666666668, 0.11393229166666667, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 21, 100.0, 0.1276207839562443], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 16455, 21, "422/Unprocessable Entity", 21, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 1388, 21, "422/Unprocessable Entity", 21, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
